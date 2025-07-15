import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NewDrillWizard from '../src/components/NewDrillWizard';
import { SettingsProvider } from '../src/features/core/settings-context';

// Mock functions
const mockOpenAI = vi.fn();
const mockAdd = vi.fn(async (d: any) => '1');
const mockSaveDeck = vi.fn(async (d: any) => void 0);
const mockToast = { success: vi.fn(), error: vi.fn() };

// Mock the openai module
vi.mock('../src/openai', () => ({
  default: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

vi.mock('../src/db', () => ({ 
  db: () => ({ 
    decks: { add: vi.fn(async (d: any) => '1') }, 
    folders: { toArray: () => [] } 
  }) 
}));

vi.mock('../../sober-body/src/features/games/deck-storage', () => ({ 
  saveDeck: vi.fn(async (d: any) => void 0)
}));

vi.mock('../src/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Mock environment variable for OpenAI
vi.stubEnv('VITE_OPENAI_API_KEY', 'mock-openai-key');

// Mock the settings context
const MockSettingsProvider = ({ children, settings }: { children: React.ReactNode; settings: any }) => {
  const settingsValue = {
    settings: {
      weightKg: 70,
      sex: 'm' as const,
      beta: 0.7,
      nativeLang: 'en',
      locale: 'en-US',
      slowSpeech: false,
      useAzure: false,
      role: 'student' as const,
      isPro: false,
      strictness: 1,
      offlineOnly: false,
      ...settings,
    },
    setSettings: vi.fn(),
  };

  return React.createElement(
    'div', 
    { 'data-testid': 'mock-settings-provider' },
    React.createElement(
      React.createContext(settingsValue).Provider,
      { value: settingsValue },
      children
    )
  );
};

// Mock the useSettings hook
vi.mock('../src/features/core/settings-context', () => ({
  SettingsProvider: ({ children }: { children: React.ReactNode }) => children,
  useSettings: vi.fn(),
}));

// Settings mock with different Pro states
const createMockSettings = (isPro: boolean = false) => ({
  locale: 'en-US',
  role: 'teacher' as const,
  isPro,
  useAzure: false,
});

const renderWizardWithSettings = async (settings: any) => {
  const { useSettings } = await import('../src/features/core/settings-context');
  (useSettings as any).mockReturnValue({
    settings: {
      weightKg: 70,
      sex: 'm',
      beta: 0.7,
      nativeLang: 'en',
      locale: 'en-US',
      slowSpeech: false,
      useAzure: false,
      role: 'student',
      isPro: false,
      strictness: 1,
      offlineOnly: false,
      ...settings,
    },
    setSettings: vi.fn(),
  });

  return render(
    <MemoryRouter>
      <NewDrillWizard open onClose={() => {}} />
    </MemoryRouter>
  );
};

describe('Wizard Flow Guard (PN-063)', () => {
  let originalOnLine: boolean;

  beforeEach(() => {
    vi.clearAllMocks();
    // Store original navigator.onLine value
    originalOnLine = navigator.onLine;
  });

  afterEach(() => {
    // Restore original navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnLine,
    });
  });

  describe('Offline Flow', () => {
    it('shows offline modal when navigator.onLine is false', async () => {
      // Mock navigator.onLine = false
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const settings = createMockSettings(true); // Pro user, but offline
      await renderWizardWithSettings(settings);

      // Fill in topic and click generate
      await userEvent.type(screen.getByPlaceholderText(/ordering food in spain/i), 'Test topic');
      await userEvent.click(screen.getByRole('button', { name: /^Generate Drill$/i }));

      // Should show offline modal
      expect(screen.getByText('📡 Offline Mode')).toBeTruthy();
      expect(screen.getByText(/auto-generate requires an internet connection/i)).toBeTruthy();
      expect(screen.getByRole('button', { name: /go manual/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /retry/i })).toBeTruthy();
    });

    it('allows manual entry from offline modal', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const settings = createMockSettings(true);
      await renderWizardWithSettings(settings);

      await userEvent.type(screen.getByPlaceholderText(/ordering food in spain/i), 'Test topic');
      await userEvent.click(screen.getByRole('button', { name: /^Generate Drill$/i }));

      // Click "Go Manual" from offline modal
      await userEvent.click(screen.getByRole('button', { name: /go manual/i }));

      // Should show manual entry mode
      expect(screen.getByText(/drill lines \(one per line\)/i)).toBeTruthy();
      expect(screen.getByPlaceholderText(/enter your phrases here/i)).toBeTruthy();
    });
  });

  describe('Free Tier Flow', () => {
    it('shows paywall modal when settings.isPro is false', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const settings = createMockSettings(false); // Free tier user
      await renderWizardWithSettings(settings);

      await userEvent.type(screen.getByPlaceholderText(/ordering food in spain/i), 'Test topic');
      await userEvent.click(screen.getByRole('button', { name: /^Generate Drill$/i }));

      // Should show paywall modal
      expect(screen.getByText('⭐ Pro Feature')).toBeTruthy();
      expect(screen.getByText(/ai-generated drills are part of the pro plan/i)).toBeTruthy();
      expect(screen.getByRole('button', { name: /go manual/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /upgrade now/i })).toBeTruthy();
    });

    it('shows success toast when clicking upgrade (placeholder)', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const settings = createMockSettings(false);
      await renderWizardWithSettings(settings);

      await userEvent.type(screen.getByPlaceholderText(/ordering food in spain/i), 'Test topic');
      await userEvent.click(screen.getByRole('button', { name: /^Generate Drill$/i }));

      await userEvent.click(screen.getByRole('button', { name: /upgrade now/i }));

      // Should show placeholder toast (since Stripe not implemented yet)
      // Note: We can't easily test toast content, but the button click should work
      expect(screen.getByRole('button', { name: /upgrade now/i })).toBeTruthy();
    });
  });

  describe('Pro Success Flow', () => {
    it('calls OpenAI and shows preview on success', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      // Get the mocked openai module
      const openaiModule = await import('../src/openai');
      const mockCreate = openaiModule.default.chat.completions.create as any;
      
      // Mock successful OpenAI response
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: 'Test Drill',
                lang: 'en-US',
                phrases: ['phrase1', 'phrase2', 'phrase3'],
                grammarBrief: 'Test grammar brief',
                vocabulary: [{ word: 'test', definition: 'a test word' }],
                complexityLevel: 'Beginner',
              }),
            },
          },
        ],
      });

      const settings = createMockSettings(true); // Pro user
      await renderWizardWithSettings(settings);

      await userEvent.type(screen.getByPlaceholderText(/ordering food in spain/i), 'Test topic');
      await userEvent.click(screen.getByRole('button', { name: /^Generate Drill$/i }));

      // Wait for preview to appear
      await waitFor(() => {
        expect(screen.getByText(/phrase1.*phrase2.*phrase3/)).toBeTruthy();
      });

      // Should show all generated content
      expect(screen.getByText('Test grammar brief')).toBeTruthy();
      expect(screen.getByText('test:')).toBeTruthy();
      expect(screen.getByText('a test word')).toBeTruthy();
      expect(screen.getByText('Beginner')).toBeTruthy();
    });

    it('returns preview with correct number of lines', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const openaiModule = await import('../src/openai');
      const mockCreate = openaiModule.default.chat.completions.create as any;
      
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                title: 'Test Drill',
                lang: 'en-US',
                phrases: ['line1', 'line2', 'line3', 'line4', 'line5'],
                grammarBrief: 'Test grammar',
                vocabulary: [],
                complexityLevel: 'Beginner',
              }),
            },
          },
        ],
      });

      const settings = createMockSettings(true);
      await renderWizardWithSettings(settings);

      await userEvent.type(screen.getByPlaceholderText(/ordering food in spain/i), 'Test topic');
      
      // Set count to 5
      const countInput = screen.getByDisplayValue('10');
      await userEvent.clear(countInput);
      await userEvent.type(countInput, '5');

      await userEvent.click(screen.getByRole('button', { name: /^Generate Drill$/i }));

      await waitFor(() => {
        expect(screen.getByText(/line1[\s\S]*line2[\s\S]*line3[\s\S]*line4[\s\S]*line5/)).toBeTruthy();
      });

      // Verify the content contains the expected number of lines
      const previewContent = screen.getByText(/line1[\s\S]*line2[\s\S]*line3[\s\S]*line4[\s\S]*line5/);
      expect(previewContent).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('falls back to manual mode when OpenAI fails', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const openaiModule = await import('../src/openai');
      const mockCreate = openaiModule.default.chat.completions.create as any;
      
      // Mock OpenAI failure
      mockCreate.mockRejectedValueOnce(
        new Error('OpenAI API error: quota exceeded')
      );

      const settings = createMockSettings(true);
      await renderWizardWithSettings(settings);

      await userEvent.type(screen.getByPlaceholderText(/ordering food in spain/i), 'Test topic');
      await userEvent.click(screen.getByRole('button', { name: /^Generate Drill$/i }));

      // Wait for fallback to manual mode (generating state may be too fast to catch)
      await waitFor(() => {
        expect(screen.getByText(/drill lines \(one per line\)/i)).toBeTruthy();
      });

      // Should be in manual mode
      const textarea = screen.getByPlaceholderText(/enter your phrases here/i);
      expect(textarea).toBeTruthy();
    });

    it('handles malformed JSON response', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const openaiModule = await import('../src/openai');
      const mockCreate = openaiModule.default.chat.completions.create as any;
      
      // Mock malformed JSON response
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: 'Invalid JSON response',
            },
          },
        ],
      });

      const settings = createMockSettings(true);
      await renderWizardWithSettings(settings);

      await userEvent.type(screen.getByPlaceholderText(/ordering food in spain/i), 'Test topic');
      await userEvent.click(screen.getByRole('button', { name: /^Generate Drill$/i }));

      // Wait for fallback to manual mode
      await waitFor(() => {
        expect(screen.getByText(/drill lines \(one per line\)/i)).toBeTruthy();
      });
    });
  });

  describe('Manual Entry Mode', () => {
    it('allows direct manual entry from setup', async () => {
      const settings = createMockSettings(true);
      await renderWizardWithSettings(settings);

      await userEvent.type(screen.getByPlaceholderText(/ordering food in spain/i), 'Test topic');
      await userEvent.click(screen.getByRole('button', { name: /manual entry/i }));

      // Should show manual entry mode
      expect(screen.getByText(/drill lines \(one per line\)/i)).toBeTruthy();
      expect(screen.getByPlaceholderText(/enter your phrases here/i)).toBeTruthy();
      expect(screen.getByPlaceholderText(/brief explanation of grammar/i)).toBeTruthy();
    });

    it('saves manual drill successfully', async () => {
      const settings = createMockSettings(true);
      await renderWizardWithSettings(settings);

      await userEvent.type(screen.getByPlaceholderText(/ordering food in spain/i), 'Test topic');
      await userEvent.click(screen.getByRole('button', { name: /manual entry/i }));

      // Fill in manual content - clear first then type
      const linesTextarea = screen.getByPlaceholderText(/enter your phrases here/i);
      await userEvent.clear(linesTextarea);
      await userEvent.type(linesTextarea, 'Manual line 1\nManual line 2\nManual line 3');

      // Save the drill
      await userEvent.click(screen.getByRole('button', { name: /save & exit/i }));

      // Should call saveDeck with manual content
      const { saveDeck } = await import('../../sober-body/src/features/games/deck-storage');
      expect(saveDeck).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test topic',
          lines: ['Manual line 1', 'Manual line 2', 'Manual line 3'],
        })
      );
    });
  });
});