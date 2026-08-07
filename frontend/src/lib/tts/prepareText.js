/**
 * Strips Markdown syntax and HTML tags from raw blog post content
 * to produce clean, natural-sounding spoken text for TTS.
 *
 * @param {string} text
 * @returns {string}
 */
export function stripMarkdown(text) {
  if (!text) return "";

  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, "")
    // Remove headers — now handles missing space after # and leading whitespace/indentation
    .replace(/^\s*#{1,6}\s*/gm, "")
    // Remove bold and italic (*text*, **text**, _text_, __text__)
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Remove inline code and code blocks
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    // Remove blockquotes (> Quote)
    .replace(/^\s*>\s+/gm, "")
    // Remove images (![alt](url)) -> keep alt text if present
    .replace(/!\[(.*?)\]\([^)]+\)/g, "$1")
    // Remove links ([text](url)) -> keep text
    .replace(/\[(.*?)\]\([^)]+\)/g, "$1")
    // Remove bullet points / numbered list markers
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    // Remove horizontal rules
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    // Slashes: keep between digits (dates like 10/07/2026), otherwise read as "or"
    .replace(/(?<!\d)\/(?!\d)/g, " or ")
    // Catch-all: strip any remaining markdown/formatting symbols Piper shouldn't speak
    .replace(/[#*_~`^|<>\\]+/g, " ")
    // Collapse multiple blank lines into single line breaks
    .replace(/\n\s*\n/g, "\n\n")
    // Collapse repeated spaces created by the replacements above
    .replace(/[ \t]+/g, " ")
    // Remove emojis (Piper may mispronounce them)
    .replace(/[😂😅❤️🩶✅❌👌🥲🫠🔥😫😍😫🥲😁🥳😊🤣😒😘🤷‍♀️🤦‍♂️🤦‍♀️🙌👍💕😀😁😂🤣😃😄😎😋😊😉😆😅😍😘🥰😗😙🥲]/g, " ")
    // Trim leading/trailing whitespace
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

/**
 * Prepares clean text for Piper synthesis by splitting long content
 * into natural sentence/paragraph chunks, placing each chunk on its
 * own line (which Piper requires for batch processing long texts).
 *
 * @param {string} rawContent
 * @returns {string} One sentence per line, ready for Piper input
 */
export function prepareTextForTTS(rawContent) {
  const clean = stripMarkdown(rawContent);

  console.log("Preparing text for Piper TTS synthesis...");

  if (!clean) return "";

  console.log("Cleaned text length:", clean.length);
  console.log("Cleaned text:", clean);
  // Split text by paragraph double-newlines
  const paragraphs = clean.split(/\n\s*\n/);

  const formattedLines = [];

  for (const para of paragraphs) {
    console.log("Processing paragraph:", para);
    const trimmedPara = para.replace(/\s+/g, " ").trim();
    if (!trimmedPara) continue;

    // Split paragraph into sentences by punctuation (. ! ?)
    const sentences = trimmedPara
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const sentence of sentences) {
      console.log("Adding sentence for TTS:", sentence);
      formattedLines.push(sentence);
    }
  }

  return formattedLines.join("\n");
}
