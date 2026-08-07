import { NextResponse } from "next/server";
import fs from "node:fs";
import { getCachedAudioPath } from "@/lib/tts/cache";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key || !/^[a-f0-9]{32}$/i.test(key)) {
    return new NextResponse("Invalid audio cache key", { status: 400 });
  }

  const filePath = getCachedAudioPath(key);
  if (!filePath || !fs.existsSync(filePath)) {
    return new NextResponse("Audio file not found in cache", { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = request.headers.get("range");

  // HTTP Range request support for audio seeking & partial content
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    return new Response(fileStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunksize),
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  const fileStream = fs.createReadStream(filePath);
  return new Response(fileStream, {
    status: 200,
    headers: {
      "Content-Length": String(fileSize),
      "Content-Type": "audio/wav",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
