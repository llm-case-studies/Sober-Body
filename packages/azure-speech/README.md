# Azure Speech Services Integration

This package provides Azure Speech Services integration for pronunciation assessment in the pronunciation coach.

## Setup

### 1. Create Azure Speech Services Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Speech Services** resource (not Translator!)
3. Choose your preferred region (e.g., `westus2`)
4. Copy the **API Key** and **Region**

### 2. Environment Variables

Add these to your `.env.local` file:

```bash
# Azure Speech Services for pronunciation assessment
VITE_AZURE_SPEECH_KEY=your_speech_services_key_here
VITE_AZURE_SPEECH_REGION=westus2
```

### 3. Different from Translator Keys

- **Azure Translator** (for translation): `VITE_TRANSLATOR_KEY`
- **Azure Speech** (for pronunciation): `VITE_AZURE_SPEECH_KEY`

These are **separate Azure resources** with different keys, but can be under the same subscription.

## Cost Structure

- **Pricing**: $1 per audio hour
- **Typical Cost**: ~$0.00028 per 1-second audio clip
- **Daily Budget**: $3.00 limit with automatic pause
- **Reset**: Budget resets at midnight

## Features

- ✅ Real-time pronunciation scoring
- ✅ Accuracy, fluency, completeness metrics
- ✅ Cost tracking and budget management
- ✅ Automatic budget watchdog
- ✅ Side-by-side comparison with browser scoring
- ✅ Detailed analysis with raw JSON data

## Usage

```typescript
import { useAzurePronunciation, useAzureBudget } from 'azure-speech';

// Check budget first
const budget = useAzureBudget();
if (budget.budgetExceeded) {
  // Show budget exceeded message
  return;
}

// Score pronunciation
const result = await useAzurePronunciation(
  audioBlob,    // WAV/PCM audio recording
  "Hello world", // Reference text
  "en-US"       // Language locale
);

// Track usage
budget.addUsageEntry(durationSecs, result.costUSD);
```

## API Response

```typescript
interface AzureScore {
  pronunciation: number;   // 0–100 overall score
  accuracy: number;        // Word accuracy
  fluency: number;         // Speech fluency  
  completeness: number;    // Content completeness
  json: any;              // Full Azure response
  latencyMs: number;      // Request latency
  costUSD: number;        // Calculated cost
}
```