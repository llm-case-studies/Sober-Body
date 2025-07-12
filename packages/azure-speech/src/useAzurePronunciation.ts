export interface AzureScore {
  pronunciation: number;   // 0–100
  accuracy: number;
  fluency: number;
  completeness: number;
  json: any;               // raw payload for research panel
  latencyMs: number;
  costUSD: number;         // calculated per request
}

interface AzureResponse {
  RecognitionStatus: string;
  DisplayText: string;
  Offset: number;
  Duration: number;
  NBest: Array<{
    Confidence: number;
    Lexical: string;
    ITN: string;
    MaskedITN: string;
    Display: string;
    PronunciationAssessment: {
      AccuracyScore: number;
      FluencyScore: number;
      CompletenessScore: number;
      PronScore: number;
    };
    Words: Array<{
      Word: string;
      Offset: number;
      Duration: number;
      PronunciationAssessment: {
        AccuracyScore: number;
        ErrorType: string;
      };
    }>;
  }>;
}

export async function useAzurePronunciation(
  blob: Blob,      // WAV/PCM recording
  refText: string,
  locale = 'en-US'
): Promise<AzureScore> {
  const startTime = performance.now();
  
  // Calculate cost: $1 per audio hour
  // Assume 32000 bytes per second for WAV/PCM
  const durationSeconds = blob.size / 32000;
  const costUSD = Math.round((durationSeconds / 3600) * 1 * 100) / 100; // Round to 2 decimals
  
  // Prepare pronunciation assessment parameters
  const pronunciationAssessment = {
    ReferenceText: refText,
    GradingSystem: "HundredMark"
  };
  
  const pronunciationParam = btoa(JSON.stringify(pronunciationAssessment));
  
  // Azure region and endpoint
  const region = import.meta.env.VITE_AZURE_SPEECH_REGION || 'westus2';
  const endpoint = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;
  
  const url = new URL(endpoint);
  url.searchParams.set('language', locale);
  url.searchParams.set('pronunciationAssessment', pronunciationParam);
  
  try {
    // Convert blob to ArrayBuffer for the request
    const audioData = await blob.arrayBuffer();
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': import.meta.env.VITE_AZURE_SPEECH_KEY || 'your-azure-key',
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
        'Accept': 'application/json'
      },
      body: audioData
    });
    
    if (!response.ok) {
      throw new Error(`Azure API error: ${response.status} ${response.statusText}`);
    }
    
    const result: AzureResponse = await response.json();
    const latencyMs = Math.round(performance.now() - startTime);
    
    // Extract scores from the response
    if (result.NBest && result.NBest.length > 0) {
      const assessment = result.NBest[0].PronunciationAssessment;
      
      return {
        pronunciation: Math.round(assessment.PronScore),
        accuracy: Math.round(assessment.AccuracyScore),
        fluency: Math.round(assessment.FluencyScore),
        completeness: Math.round(assessment.CompletenessScore),
        json: result,
        latencyMs,
        costUSD
      };
    } else {
      throw new Error('No pronunciation assessment data in response');
    }
    
  } catch (error) {
    // Return fallback scores if Azure fails
    console.error('Azure Speech API error:', error);
    
    return {
      pronunciation: 0,
      accuracy: 0,
      fluency: 0,
      completeness: 0,
      json: { error: error instanceof Error ? error.message : 'Unknown error' },
      latencyMs: Math.round(performance.now() - startTime),
      costUSD
    };
  }
}