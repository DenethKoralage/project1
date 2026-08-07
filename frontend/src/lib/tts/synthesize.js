import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// Hard ceiling timeout per chunk.
// Medium ONNX models on CPU can take 40-60s for 3 sentences — 120s gives
// comfortable headroom. Lower this if you switch to a -low quality model.
const PER_CHUNK_TIMEOUT_MS = 120_000;

// Sentences per Piper call. Smaller = faster individual chunks on CPU.
// 3 sentences keeps each call under ~30s on typical hardware with medium model.
const SENTENCES_PER_CHUNK = 3;

// ── In-Memory Queue Mutex ──────────────────────────────────────────────────
// Ensures only ONE full synthesis job runs at a time.
// Each job may internally loop over multiple chunks, but those chunks run
// inside the same task — not re-enqueued individually — avoiding deadlock.
let isSynthesizing = false;
const queue = [];

function processQueue() {
  if (isSynthesizing || queue.length === 0) return;
  console.log(`Starting next TTS synthesis job in queue. Remaining jobs: ${queue.length}`);
  isSynthesizing = true;
  const nextTask = queue.shift();
  if (nextTask) {
    console.log(`Processing TTS synthesis job. Queue length: ${queue.length}`);
    nextTask().finally(() => {
      isSynthesizing = false;
      processQueue();
    });
  }
}

function enqueueJob(jobFn) {
  console.log(`Enqueuing TTS synthesis job. Current queue length: ${queue.length}`);
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        resolve(await jobFn());
      } catch (err) {
        reject(err);
      }
    });
    processQueue();
  });
}

// ── Paths Resolution ────────────────────────────────────────────────────────

export function getPiperPaths() {
  const isWin = os.platform() === "win32";
  const binaryName = isWin ? "piper.exe" : "piper";

  console.log("Detecting Piper binary and voice model paths...");

  if (process.env.PIPER_PATH && process.env.PIPER_MODEL_PATH) {
    console.log(`Using voice model from PIPER_MODEL_PATH: ${process.env.PIPER_MODEL_PATH}`);
    return {
      binPath: process.env.PIPER_PATH,
      modelPath: process.env.PIPER_MODEL_PATH,
    };
  }

  const candidateBinPaths = [
    process.env.PIPER_PATH,
    path.join(process.cwd(), "tts-engine", "bin", binaryName),
    path.join(process.cwd(), "tts-engine", "piper", "piper", binaryName),
    path.join(process.cwd(), "tts-engine", "piper", binaryName),
  ].filter(Boolean);

  let binPath = candidateBinPaths[1];
  for (const candidate of candidateBinPaths) {
    if (fs.existsSync(candidate)) {
      binPath = candidate;
      console.log(`Piper binary found at: ${candidate}`);
      break;
    }
    console.log(`Piper binary not found at: ${candidate}`);
  }

  // Auto-scan voices dir, preferring -low models for 4x faster CPU speed
  const voicesDir = path.join(process.cwd(), "tts-engine", "voices");
  let modelPath = path.join(voicesDir, "en_US-lessac-medium.onnx");

  console.log(`Scanning voices directory for available models: ${voicesDir}`);

  if (fs.existsSync(voicesDir)) {
    const files = fs.readdirSync(voicesDir);
    const onnxFiles = files.filter((f) => f.endsWith(".onnx"));
    const lowModel = onnxFiles.find((f) => f.includes("-low.onnx"));
    const mediumModel = onnxFiles.find((f) => f.includes("-medium.onnx"));

    if (lowModel) {
      modelPath = path.join(voicesDir, lowModel);
      console.log(`Using low-quality voice model for faster synthesis: ${lowModel}`);
    } else if (mediumModel) {
      modelPath = path.join(voicesDir, mediumModel);
      console.log(`Using medium-quality voice model: ${mediumModel}`);
    } else if (onnxFiles.length > 0) {
      modelPath = path.join(voicesDir, onnxFiles[0]);
      console.log(`Using default voice model: ${onnxFiles[0]}`);
    }
  }

  console.log(`Final Piper binary path: ${binPath}`);
  console.log(`Final voice model path: ${modelPath}`);

  return { binPath, modelPath };
}

/**
 * Checks whether the Piper binary and model file exist.
 * @returns {{ installed: boolean, missingReason: string|null }}
 */
export function checkPiperInstallation() {
  const { binPath, modelPath } = getPiperPaths();

  console.log("Checking Piper installation...");

  if (!fs.existsSync(binPath)) {
    console.log(`Piper executable not found at "${binPath}". Please follow Step 1 setup in README.md to download piper_windows_amd64.zip into tts-engine/bin/.`);
    return {
      installed: false,
      missingReason: `Piper executable not found at "${binPath}". Please follow Step 1 setup in README.md to download piper_windows_amd64.zip into tts-engine/bin/.`,
    };
  }

  if (!fs.existsSync(modelPath)) {
    console.log(`Voice model file not found at "${modelPath}". Please download en_US-lessac-medium.onnx and .onnx.json into tts-engine/voices/.`);
    return {
      installed: false,
      missingReason: `Voice model file not found at "${modelPath}". Please download en_US-lessac-medium.onnx and .onnx.json into tts-engine/voices/.`,
    };
  }

  console.log("Piper installation is valid.");
  return { installed: true, missingReason: null };
}

// ── WAV PCM Buffer Concatenation ────────────────────────────────────────────

/**
 * Concatenates an array of WAV buffers into a single valid WAV buffer.
 * Assumes all chunks share the same format (mono 16-bit PCM, 22050Hz) — guaranteed
 * when all buffers come from the same Piper binary + voice model.
 *
 * @param {Buffer[]} wavBuffers
 * @returns {Buffer}
 */
export function concatWavBuffers(wavBuffers) {
  if (!wavBuffers || wavBuffers.length === 0) {
    console.error("No WAV buffers provided for concatenation.");
    throw new Error("No WAV buffers provided for concatenation.");
  }
  if (wavBuffers.length === 1) {
    console.log("Only one WAV buffer provided. Returning it without concatenation.");
    return wavBuffers[0];
  }

  const HEADER_SIZE = 44;
  // Copy the first buffer's header — we'll update the size fields in place
  const header = Buffer.from(wavBuffers[0].subarray(0, HEADER_SIZE));

  const pcmPayloads = wavBuffers.map((buf) => buf.subarray(HEADER_SIZE));
  const totalPcm = pcmPayloads.reduce((sum, p) => sum + p.length, 0);

  // WAV spec: offset 4 = ChunkSize (file size - 8), offset 40 = SubChunk2Size (PCM bytes)
  header.writeUInt32LE(totalPcm + 36, 4);
  header.writeUInt32LE(totalPcm, 40);

  console.log(`Concatenated ${wavBuffers.length} WAV buffers. Total PCM size: ${totalPcm} bytes. Final WAV size: ${totalPcm + HEADER_SIZE} bytes.`);
  return Buffer.concat([header, ...pcmPayloads]);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function chunkSentences(text, maxPerChunk = SENTENCES_PER_CHUNK) {
  console.log(`Chunking text into sentences (max ${maxPerChunk} per chunk)...`);
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < lines.length; i += maxPerChunk) {
    chunks.push(lines.slice(i, i + maxPerChunk).join("\n"));
  }
  return chunks;
}

function cleanupTempFiles(paths) {
  console.log(`Cleaning up temporary files: ${paths.join(", ")}`);
  for (const p of paths) {
    if (p && fs.existsSync(p)) {
      fs.unlink(p, () => {});
    }
  }
}

// ── Single Chunk Spawn (NO queue — caller already holds the mutex) ───────────

/**
 * Spawns one Piper process for a single chunk of text.
 * Must only be called from inside a job that is already running under enqueueJob().
 * Does NOT re-enqueue — that would cause a deadlock.
 *
 * @param {string} binPath
 * @param {string} modelPath
 * @param {string} chunkText
 * @param {number} chunkIndex  (0-based, for error messages)
 * @param {number} totalChunks
 * @returns {Promise<Buffer>} WAV buffer for this chunk
 */
function spawnChunk(binPath, modelPath, chunkText, chunkIndex, totalChunks) {
  return new Promise(async (resolve, reject) => {
    console.log(`Spawning Piper process for chunk ${chunkIndex + 1}/${totalChunks}`);
    const uid = `${Date.now()}_c${chunkIndex}_${Math.random().toString(36).slice(2)}`;
    const tempWavPath = path.join(os.tmpdir(), `piper_out_${uid}.wav`);

    let isSettled = false;

    const piperProc = spawn(binPath, [
      "--model", modelPath,
      "--output_file", tempWavPath,
      "--sentence_silence", "0.1",
    ]);

    piperProc.stdin.write(chunkText);
    piperProc.stdin.end();   // <-- critical: without this, Piper waits forever

    let stderrOutput = "";
    piperProc.stderr.on("data", (d) => { stderrOutput += d.toString(); });

    // Hard per-chunk timeout
    const timeoutId = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      piperProc.kill("SIGTERM");
      setTimeout(() => { try { piperProc.kill("SIGKILL"); } catch {} }, 1000);
      cleanupTempFiles([tempWavPath]);
      reject(new Error(
        `Synthesis timed out after ${PER_CHUNK_TIMEOUT_MS / 1000}s ` +
        `on chunk ${chunkIndex + 1} of ${totalChunks}. ` +
        `Reduce article length or increase PER_CHUNK_TIMEOUT_MS.`
      ));
    }, PER_CHUNK_TIMEOUT_MS);

    piperProc.on("error", (err) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeoutId);
      cleanupTempFiles([tempWavPath]);
      reject(new Error(
        `Failed to spawn Piper for chunk ${chunkIndex + 1}/${totalChunks}: ${err.message}`
      ));
    });

    piperProc.on("close", (code) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeoutId);

      if (code === 0 && fs.existsSync(tempWavPath)) {
        console.log(`Piper chunk ${chunkIndex + 1}/${totalChunks} completed successfully. Reading WAV output...`);
        fs.promises.readFile(tempWavPath)
          .then((buf) => { cleanupTempFiles([tempWavPath]); resolve(buf); })
          .catch((err) => { cleanupTempFiles([tempWavPath]); reject(err); });
      } else {
        console.error(`Piper exited with code ${code} on chunk ${chunkIndex + 1}/${totalChunks}. Stderr: ${stderrOutput.trim() || "(none)"}`);
        cleanupTempFiles([tempWavPath]);
        reject(new Error(
          `Piper exited with code ${code} on chunk ${chunkIndex + 1}/${totalChunks}. ` +
          `Stderr: ${stderrOutput.trim() || "(none)"}`
        ));
      }
    });
  });
}

// ── Main Synthesis Entrypoint ───────────────────────────────────────────────

/**
 * Synthesizes prepared text into a WAV file at outputWavPath.
 *
 * The entire multi-chunk loop runs as ONE queued job so:
 *   - Only one Piper process is alive at any moment (CPU guard)
 *   - No re-enqueue deadlock (chunks call spawnChunk directly, not enqueueJob)
 *
 * @param {string} preparedText   One sentence per line (from prepareText.js)
 * @param {string} outputWavPath  Destination file path (from cache.js getCacheFilePath)
 * @returns {Promise<string>}     Resolves with outputWavPath on success
 */
export async function synthesizeToFile(preparedText, outputWavPath) {
  const status = checkPiperInstallation();
  if (!status.installed) {
    console.error(`Piper installation check failed: ${status.missingReason}`);
    throw new Error(status.missingReason);
  }

  const { binPath, modelPath } = getPiperPaths();
  const textChunks = chunkSentences(preparedText, SENTENCES_PER_CHUNK);

  if (textChunks.length === 0) {
    console.error("No speakable text found after preparation.");
    throw new Error("No speakable text found after preparation.");
  }

  // Entire loop is ONE queued job — chunks spawn sequentially inside it
  return enqueueJob(async () => {
    const chunkBuffers = [];

    console.log(`Starting synthesis of ${textChunks.length} chunk(s) to "${outputWavPath}"...`);
    for (let i = 0; i < textChunks.length; i++) {
      console.log(`Synthesizing chunk ${i + 1}/${textChunks.length}...`);
      const buf = await spawnChunk(binPath, modelPath, textChunks[i], i, textChunks.length);
      chunkBuffers.push(buf);
    }

    const finalWav = concatWavBuffers(chunkBuffers);
    await fs.promises.writeFile(outputWavPath, finalWav);
    return outputWavPath;
  });
}
