import { NextResponse } from "next/server";
import { fetchBlog } from "@/lib/blogApi";
import { getBlogPostById } from "@/lib/blogs";
import { prepareTextForTTS } from "@/lib/tts/prepareText";
import { getCacheKey, getCachedAudioPath, getCacheFilePath } from "@/lib/tts/cache";
import { checkPiperInstallation, synthesizeToFile } from "@/lib/tts/synthesize";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { blogId } = body;

    if (!blogId) {
      console.log("Missing required parameter: blogId");
      return NextResponse.json(
        { error: "Missing required parameter: blogId" },
        { status: 400 }
      );
    }

    // 1. Check if Piper TTS is installed & voice model exists
    const installation = checkPiperInstallation();
    if (!installation.installed) {
      console.error("Piper TTS Engine not installed or voice model missing:", installation.missingReason);
      return NextResponse.json(
        {
          error: "TTS Engine Not Installed",
          message: installation.missingReason,
        },
        { status: 503 }
      );
    }

    // 2. Fetch authoritative blog post server-side (never trusting client text)
    let post = null;
    try {
      post = await fetchBlog(blogId);
    } catch {
      // Fallback to local storage/default posts helper if backend API unavailable
      post = getBlogPostById(blogId);
    }

    if (!post || (!post.content && !post.title)) {
      console.log(`Blog post with ID "${blogId}" not found.`);
      return NextResponse.json(
        { error: `Blog post with ID "${blogId}" not found.` },
        { status: 404 }
      );
    }

    // 3. Prepare clean text (one sentence per line, markdown stripped)
    const fullText = `${post.title}. ${post.content || post.excerpt || ""}`;
    const preparedText = prepareTextForTTS(fullText);

    // 4. Validate that there is speakable text
    console.log(`Prepared text for TTS: "${preparedText}"`);
    if (!preparedText || preparedText.trim().length === 0) {
      console.log(`Blog post with ID "${blogId}" contains no speakable text.`);
      return NextResponse.json(
        { error: "Blog post contains no speakable text content." },
        { status: 400 }
      );
    }

    // 4. Compute cache key & check caching layer
    const cacheKey = getCacheKey(blogId, preparedText);
    const existingCachePath = getCachedAudioPath(cacheKey);

    if (existingCachePath) {
      console.log(`Cache hit for key "${cacheKey}". Serving cached audio.`);
      return NextResponse.json({
        success: true,
        cached: true,
        cacheKey,
        audioUrl: `/api/tts/audio?key=${cacheKey}`,
      });
    }

    // 5. Cache miss — Synthesize audio with Piper
    const targetFilePath = getCacheFilePath(cacheKey);
    const startTime = Date.now();

    await synthesizeToFile(preparedText, targetFilePath);

    const generationTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      cached: false,
      cacheKey,
      audioUrl: `/api/tts/audio?key=${cacheKey}`,
      generationTimeMs,
    });
  } catch (err) {
    console.error("Error occurred during TTS synthesis:", err);
    return NextResponse.json(
      {
        error: "TTS Synthesis Failed",
        message: err.message || "An unexpected error occurred during audio generation.",
      },
      { status: 500 }
    );
  }
}
