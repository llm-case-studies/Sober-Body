# Pronunciation Coach

Standalone React playground for the PronunciationCoach component used in Sober‑Body.

```
pnpm --filter packages/pronunciation-coach dev
```

Create a `.env.local` file at the repository root with the following keys to
enable translation features.  Each workspace reads variables from that common
location:

```
VITE_TRANSLATOR_KEY=your-azure-key
VITE_TRANSLATOR_REGION=your-region
VITE_TRANSLATOR_ENDPOINT=https://<your-translator>.cognitiveservices.azure.com
```
