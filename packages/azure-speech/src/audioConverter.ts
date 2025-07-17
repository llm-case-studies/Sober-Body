/**
 * Audio format converter for Azure Speech Services compatibility
 * Converts WebM/Opus to WAV/PCM format that Azure expects
 */

export async function convertToWav(audioBlob: Blob): Promise<Blob> {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000 // Azure prefers 16kHz
    });

    // Convert blob to ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Get PCM data (mono channel)
    const channelData = audioBuffer.getChannelData(0);
    
    // Convert float32 to int16 PCM
    const pcmData = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      // Clamp to [-1, 1] and convert to 16-bit
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      pcmData[i] = sample * 0x7FFF;
    }
    
    // Create WAV header
    const wavHeader = createWavHeader(pcmData.length * 2, 16000, 1);
    
    // Combine header and data
    const wavData = new Uint8Array(wavHeader.length + pcmData.length * 2);
    wavData.set(wavHeader, 0);
    wavData.set(new Uint8Array(pcmData.buffer), wavHeader.length);
    
    // Close audio context to free resources
    await audioContext.close();
    
    return new Blob([wavData], { type: 'audio/wav' });
    
  } catch (error) {
    console.error('Audio conversion failed:', error);
    throw new Error(`Failed to convert audio to WAV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function createWavHeader(dataLength: number, sampleRate: number, channels: number): Uint8Array {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  // WAV header structure
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');                                    // ChunkID
  view.setUint32(4, 36 + dataLength, true);                 // ChunkSize
  writeString(8, 'WAVE');                                    // Format
  writeString(12, 'fmt ');                                   // Subchunk1ID
  view.setUint32(16, 16, true);                              // Subchunk1Size
  view.setUint16(20, 1, true);                               // AudioFormat (PCM)
  view.setUint16(22, channels, true);                        // NumChannels
  view.setUint32(24, sampleRate, true);                      // SampleRate
  view.setUint32(28, sampleRate * channels * 2, true);       // ByteRate
  view.setUint16(32, channels * 2, true);                    // BlockAlign
  view.setUint16(34, 16, true);                              // BitsPerSample
  writeString(36, 'data');                                   // Subchunk2ID
  view.setUint32(40, dataLength, true);                      // Subchunk2Size
  
  return new Uint8Array(header);
}

/**
 * Check if audio conversion is needed based on blob type
 */
export function needsConversion(audioBlob: Blob): boolean {
  return !audioBlob.type.includes('wav') && !audioBlob.type.includes('audio/wav');
}

/**
 * Get audio format info for debugging
 */
export function getAudioInfo(audioBlob: Blob) {
  return {
    type: audioBlob.type,
    size: audioBlob.size,
    needsConversion: needsConversion(audioBlob)
  };
}