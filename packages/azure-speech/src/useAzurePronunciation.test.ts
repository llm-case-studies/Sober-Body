import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAzurePronunciation } from './useAzurePronunciation';

// Mock fetch
global.fetch = vi.fn();

// Mock Blob with arrayBuffer method
class MockBlob {
  constructor(public content: string[], public options?: BlobPropertyBag) {
    this.size = content.join('').length;
  }
  size: number;
  
  async arrayBuffer(): Promise<ArrayBuffer> {
    const text = this.content.join('');
    const buffer = new ArrayBuffer(text.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < text.length; i++) {
      view[i] = text.charCodeAt(i);
    }
    return buffer;
  }
}

describe('useAzurePronunciation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock performance.now
    vi.spyOn(performance, 'now').mockReturnValue(1000);
  });

  it('calculates cost correctly for 1-second audio', async () => {
    // Mock a 1-second audio blob (32000 bytes)
    const mockBlob = new MockBlob(['x'.repeat(32000)], { type: 'audio/wav' }) as any;
    
    // Mock successful Azure response
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        NBest: [{
          PronunciationAssessment: {
            PronScore: 85,
            AccuracyScore: 90,
            FluencyScore: 80,
            CompletenessScore: 95
          }
        }]
      })
    });

    const result = await useAzurePronunciation(mockBlob, 'Hello world', 'en-US');
    
    // Cost should be approximately $0.00028 for 1 second
    // 1 second / 3600 seconds per hour * $1 per hour = $0.00028
    expect(result.costUSD).toBeGreaterThan(0);
    expect(result.costUSD).toBeLessThan(0.001); // Less than $0.001
    expect(result.pronunciation).toBe(85);
    expect(result.accuracy).toBe(90);
    expect(result.fluency).toBe(80);
    expect(result.completeness).toBe(95);
  });

  it('handles API errors gracefully', async () => {
    const mockBlob = new MockBlob(['test'], { type: 'audio/wav' }) as any;
    
    // Mock API error
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const result = await useAzurePronunciation(mockBlob, 'Hello world', 'en-US');
    
    // Should return fallback scores
    expect(result.pronunciation).toBe(0);
    expect(result.accuracy).toBe(0);
    expect(result.fluency).toBe(0);
    expect(result.completeness).toBe(0);
    expect(result.json.error).toBe('Network error');
  });

  it('constructs correct API URL', async () => {
    const mockBlob = new MockBlob(['test'], { type: 'audio/wav' }) as any;
    
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        NBest: [{
          PronunciationAssessment: {
            PronScore: 85,
            AccuracyScore: 90,
            FluencyScore: 80,
            CompletenessScore: 95
          }
        }]
      })
    });

    await useAzurePronunciation(mockBlob, 'Hello world', 'es-ES');
    
    // Check that fetch was called with correct URL
    const fetchCall = (fetch as any).mock.calls[0];
    const url = fetchCall[0];
    
    expect(url).toContain('westus2.stt.speech.microsoft.com');
    expect(url).toContain('language=es-ES');
    expect(url).toContain('pronunciationAssessment=');
  });
});