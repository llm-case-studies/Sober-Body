import React from 'react'
import { vi } from 'vitest'
// Redirect coach-ui imports that still point at Sober-Body
vi.mock("../../../../apps/sober-body/src/features/games/deck-context", async () =>
  await import("@/features/deck-context")
)
vi.mock(
  "../../../../apps/sober-body/src/features/core/settings-context",
  () => ({
    // minimal but complete shape Coach-UI expects
    useSettings: () => ({
      ttsEnabled: false,
      srEnabled: false,
      locale: "en-US",
      nativeLang: "en",
    }),
  }),
)
vi.mock('coach-ui', () => ({ PronunciationCoachUI: () => React.createElement('div', null, 'Dummy deck') }));
