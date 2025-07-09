import React from 'react'
import { vi } from 'vitest'

vi.mock('coach-ui', () => ({
  __esModule: true,
  PronunciationCoachUI: () => React.createElement('div', null, 'Dummy deck'),
  default: () => React.createElement('div', null, 'Dummy deck'),
}));
vi.mock(
  new URL('../../../packages/coach-ui/index.ts', import.meta.url).pathname,
  () => ({
    __esModule: true,
    PronunciationCoachUI: () => React.createElement('div', null, 'Dummy deck'),
    default: () => React.createElement('div', null, 'Dummy deck'),
  })
);
console.info('✅ coach-ui mock active');
