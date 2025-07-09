import React from 'react'
import { vi } from 'vitest'
// Redirect coach-ui imports that still point at Sober-Body
vi.mock(
  "/workspace/Sober-Body/apps/sober-body/src/features/games/deck-context.tsx",
  async () => {
    console.info("✅ DeckContext mock active");
    return await import("@/features/deck-context");
  }
);
vi.mock(
  "/workspace/Sober-Body/apps/sober-body/src/features/core/settings-context.tsx",
  () => {
    console.info("✅ SettingsContext mock active");
    return {
      useSettings: () => ({
        locale: "en-US",
        nativeLang: "en",
        ttsEnabled: false,
        srEnabled: false,
      }),
    };
  },
);

vi.mock('coach-ui', () => ({ PronunciationCoachUI: () => React.createElement('div', null, 'Dummy deck') }));
