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

import { convertToWav, needsConversion, getAudioInfo } from './audioConverter';

export async function useAzurePronunciation(
  blob: Blob,      // Audio recording (any format)
  refText: string,
  locale = 'en-US'
): Promise<AzureScore> {
  const startTime = performance.now();
  
  console.log('Original audio info:', getAudioInfo(blob));
  
  // Convert to WAV if needed
  let processedBlob = blob;
  if (needsConversion(blob)) {
    console.log('Converting audio to WAV format for Azure compatibility...');
    try {
      processedBlob = await convertToWav(blob);
      console.log('Converted audio info:', getAudioInfo(processedBlob));
    } catch (error) {
      console.warn('Audio conversion failed, using original format:', error);
    }
  }
  
  // Calculate cost: $1 per audio hour
  // For WAV/PCM: 16kHz * 2 bytes = 32000 bytes per second
  const durationSeconds = processedBlob.size / 32000;
  const costUSD = Math.round((durationSeconds / 3600) * 1 * 100) / 100; // Round to 2 decimals
  
  // Prepare pronunciation assessment parameters
  const pronunciationAssessment = {
    ReferenceText: refText,
    GradingSystem: "HundredMark",
    Granularity: "Phoneme",
    Dimension: "Comprehensive"
  };
  
  // Use base64 encoding that handles Unicode characters
  const pronunciationParam = btoa(unescape(encodeURIComponent(JSON.stringify(pronunciationAssessment))));
  
  // Azure region and endpoint for pronunciation assessment
  const region = import.meta.env.VITE_AZURE_SPEECH_REGION || 'westus2';
  const endpoint = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;
  
  const url = new URL(endpoint);
  url.searchParams.set('language', locale);
  url.searchParams.set('format', 'detailed');
  url.searchParams.set('profanity', 'raw');
  
  console.log('Pronunciation assessment config:', pronunciationAssessment);
  console.log('Base64 encoded config:', pronunciationParam);
  
  try {
    // Convert blob to ArrayBuffer for the request
    const audioData = await processedBlob.arrayBuffer();
    
    // Determine content type based on processed blob type
    let contentType = 'audio/wav; codecs=audio/pcm; samplerate=16000';
    if (processedBlob.type.includes('webm')) {
      contentType = 'audio/webm; codecs=opus';
    } else if (processedBlob.type.includes('ogg')) {
      contentType = 'audio/ogg; codecs=opus';
    }
    
    console.log('Sending audio to Azure:', { 
      originalType: blob.type,
      processedType: processedBlob.type,
      contentType, 
      originalSize: blob.size,
      processedSize: processedBlob.size,
      refText: refText 
    });
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': import.meta.env.VITE_AZURE_SPEECH_KEY || 'your-azure-key',
        'Content-Type': contentType,
        'Accept': 'application/json',
        'Pronunciation-Assessment': pronunciationParam
      },
      body: audioData
    });
    
    console.log('Azure API response status:', response.status, response.statusText);
    console.log('Azure API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Azure API error response:', errorText);
      throw new Error(`Azure API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const result: AzureResponse = await response.json();
    const latencyMs = Math.round(performance.now() - startTime);
    
    // Log the full response for debugging
    console.log('Azure Speech API response:', result);
    console.log('Response keys:', Object.keys(result));
    console.log('Response JSON:', JSON.stringify(result, null, 2));
    
    // Extract scores from the response
    if (result.NBest && result.NBest.length > 0) {
      const bestResult = result.NBest[0];
      
      console.log('Best result object:', bestResult);
      console.log('Available keys in bestResult:', Object.keys(bestResult));
      
      // Azure returns scores directly in NBest[0] for pronunciation assessment
      return {
        pronunciation: Math.round(bestResult.PronScore || 0),
        accuracy: Math.round(bestResult.AccuracyScore || 0),
        fluency: Math.round(bestResult.FluencyScore || 0),
        completeness: Math.round(bestResult.CompletenessScore || 0),
        json: result,
        latencyMs,
        costUSD
      };
    } else if (result.RecognitionStatus === 'Success' && result.DisplayText === '') {
      // Azure processed audio but couldn't extract speech (likely format issue)
      console.warn('Azure recognized audio but extracted no text - possibly unsupported audio format');
      return {
        pronunciation: 0,
        accuracy: 0,
        fluency: 0,
        completeness: 0,
        json: { ...result, warning: 'Audio format may not be supported for pronunciation assessment' },
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