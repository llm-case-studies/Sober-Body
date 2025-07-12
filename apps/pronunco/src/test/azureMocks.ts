import { vi } from 'vitest';

// Mock the entire Azure Speech module to avoid hook issues
export const mockAzureSpeech = () => {
  vi.mock('../../../azure-speech/src', () => ({
    useAzurePronunciation: vi.fn().mockResolvedValue({
      pronunciation: 85,
      accuracy: 90,
      fluency: 80,
      completeness: 95,
      json: { mock: true },
      latencyMs: 100,
      costUSD: 0.001
    }),
    useAzureBudget: vi.fn(() => ({
      budgetExceeded: false,
      todaySpending: 0,
      remainingBudget: 3,
      addUsageEntry: vi.fn(),
      usageEntries: []
    }))
  }));
};

// Mock coach-ui to avoid all React hook issues
export const mockCoachUI = () => {
  vi.mock('coach-ui', () => ({
    PronunciationCoachUI: () => <h2>She sells seashells</h2>
  }));
};