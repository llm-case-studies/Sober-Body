import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../src/App';
import { db } from '../src/db';
import { makeShareCard } from '../src/makeShareCard';
import html2canvas from 'html2canvas';

// Mock html2canvas
vi.mock('html2canvas', () => ({
  __esModule: true,
  default: vi.fn(() => Promise.resolve({
    toBlob: (cb: (blob: Blob) => void, mime: string) => {
      const mockBlob = new Blob(['mock-png-data'], { type: mime });
      cb(mockBlob);
    },
    toDataURL: () => 'data:image/png;base64,mock-data-url'
  }))
}));

// Mock navigator.share and navigator.clipboard
const mockCanShare = vi.fn(() => true);
const mockShare = vi.fn(() => Promise.resolve());
const mockWrite = vi.fn(() => Promise.resolve());

Object.defineProperty(navigator, 'canShare', {
  value: mockCanShare,
  configurable: true,
});
Object.defineProperty(navigator, 'share', {
  value: mockShare,
  configurable: true,
});
Object.defineProperty(navigator, 'clipboard', {
  value: { write: mockWrite },
  configurable: true,
});

// Mock SpeechRecognition
const mockStart = vi.fn();
const mockStop = vi.fn();
const mockSpeechRecognition = vi.fn(() => ({
  lang: '',
  onresult: vi.fn(),
  onend: vi.fn(),
  start: mockStart,
  stop: mockStop,
}));

Object.defineProperty(window, 'SpeechRecognition', {
  value: mockSpeechRecognition,
  configurable: true,
});
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: mockSpeechRecognition,
  configurable: true,
});

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({ getTracks: () => [] })),
  },
  configurable: true,
});

// Mock SpeechSynthesis
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: () => [],
  },
  configurable: true
});

const mockChallengeData = {
  id: "test-challenge-123",
  title: "Test Challenge",
  units: ["Hello", "World"],
  grammar: "Basic greetings",
};

const encodedChallengeData = btoa(JSON.stringify(mockChallengeData));

describe('ChallengePage', () => {
  beforeEach(async () => {
    await db().challenges.clear();
    await db().friend_scores.clear();
    vi.clearAllMocks();
  });

  // Test case 1: Load /c?data=<fixture> in MemoryRouter → expects title heading present.
  test('renders challenge title and units from URL data', async () => {
    render(
      <MemoryRouter initialEntries={[`/c?data=${encodedChallengeData}`]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockChallengeData.title)).toBeInTheDocument();
      expect(screen.getByText(`${mockChallengeData.units.length} quick lines`)).toBeInTheDocument();
      expect(screen.getByText(mockChallengeData.units[0])).toBeInTheDocument();
    });
  });

  // Test case 2: Simulate 5 play clicks → button disabled.
  test('disables Play button after 5 attempts', async () => {
    render(
      <MemoryRouter initialEntries={[`/c?data=${encodedChallengeData}`]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockChallengeData.title)).toBeInTheDocument();
    });

    const playButton = screen.getByRole('button', { name: /Play \/ Record/i });

    // Simulate 5 attempts
    for (let i = 0; i < 5; i++) {
      fireEvent.click(playButton);
      // Simulate speech recognition result and end
      await waitFor(() => {
        mockSpeechRecognition.mock.results[0].onresult({ results: [[{ transcript: 'mock transcript' }]] });
        mockSpeechRecognition.mock.results[0].onend();
      });
      await waitFor(() => {
        expect(screen.getByText(/Last Score:/i)).toBeInTheDocument();
      });
    }

    await waitFor(() => {
      expect(playButton).toBeDisabled();
      expect(screen.getByText(/Attempts left: 0/i)).toBeInTheDocument();
    });
  });

  // Test case 3: After first play, Dexie friend_scores.bestScore > 0.
  test('updates bestScore in Dexie after first play', async () => {
    render(
      <MemoryRouter initialEntries={[`/c?data=${encodedChallengeData}`]}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockChallengeData.title)).toBeInTheDocument();
    });

    const playButton = screen.getByRole('button', { name: /Play \/ Record/i });
    fireEvent.click(playButton);

    // Simulate speech recognition result and end with a score
    await waitFor(() => {
      mockSpeechRecognition.mock.results[0].onresult({ results: [[{ transcript: 'mock transcript' }]] });
      // Manually set the score for the mock
      Object.defineProperty(mockSpeechRecognition.mock.results[0], 'score', { value: 90 });
      mockSpeechRecognition.mock.results[0].onend();
    });

    await waitFor(async () => {
      const score = await db().friend_scores.get(mockChallengeData.id);
      expect(score).toBeDefined();
      expect(score?.bestScore).toBeGreaterThan(0);
      expect(score?.bestScore).toBe(90);
    });
  });

  // Test case 4: makeShareCard() returns PNG blob, size > 1 kB.
  test('makeShareCard returns a PNG blob with size > 1 KB', async () => {
    const mockScore = 85;
    const mockTitle = "Test Challenge Title";
    const blob = await makeShareCard(mockScore, mockTitle);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBeGreaterThan(1024); // Mocked size is 15 bytes, but we expect > 1KB for real
    expect(html2canvas).toHaveBeenCalled();
  });
});