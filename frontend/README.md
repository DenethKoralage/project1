This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Local Piper text-to-speech

This project uses Piper locally; it makes no hosted TTS calls and needs no API key. The binary, voice model, and generated audio are intentionally gitignored.

1. Download the Windows AMD64 release from [Piper Releases](https://github.com/rhasspy/piper/releases), and extract the zip contents into `tts-engine/bin/` (so `tts-engine/bin/piper.exe` exists).
2. Download `en_US-lessac-medium.onnx` and `en_US-lessac-medium.onnx.json` from [Piper Voices](https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/medium) into `tts-engine/voices/`.
3. Verify it from PowerShell:
   ```powershell
   "Hello text to speech" | .\tts-engine\bin\piper.exe --model .\tts-engine\voices\en_US-lessac-medium.onnx --output_file test.wav
   ```

The local audio cache is `.cache/tts-audio/`, keyed by post ID and prepared text hash. To specify custom binary or voice model locations, set `PIPER_PATH` and `PIPER_MODEL_PATH` in your `.env` file.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
