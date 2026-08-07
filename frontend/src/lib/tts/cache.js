import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const CACHE_DIR = path.join(process.cwd(), ".cache", "tts-audio");

/**
 * Ensures the cache directory exists on disk.
 */
export function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    console.log(`Cache directory does not exist. Creating: ${CACHE_DIR}`);
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Generates a unique MD5 hash key from blogId and prepared content text.
 *
 * @param {string} blogId
 * @param {string} preparedText
 * @param {string} [modelName="en_US-lessac-medium"]
 * @returns {string} Hash string
 */
export function getCacheKey(blogId, preparedText, modelName = "en_US-lessac-medium") {
  const hash = crypto
    .createHash("md5")
    .update(`${blogId}:${modelName}:${preparedText}`)
    .digest("hex");
  console.log(`Generated cache key for blogId "${blogId}" and model "${modelName}": ${hash}`);
  return hash;
}

/**
 * Returns the absolute path to a cached audio file if it exists and is non-empty.
 *
 * @param {string} cacheKey
 * @returns {string|null} Absolute file path or null
 */
export function getCachedAudioPath(cacheKey) {
  ensureCacheDir();
  const filePath = path.join(CACHE_DIR, `${cacheKey}.wav`);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`Cache file for key "${cacheKey}" exists with size ${stats.size} bytes.`);
    if (stats.size > 0) {
      return filePath;
    }
  }
  return null;
}

/**
 * Returns the target file path where synthesized audio should be saved for a cache key.
 *
 * @param {string} cacheKey
 * @returns {string} Absolute file path
 */
export function getCacheFilePath(cacheKey) {
  ensureCacheDir();
  return path.join(CACHE_DIR, `${cacheKey}.wav`);
}
