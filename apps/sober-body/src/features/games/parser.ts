import type { SplitMode } from './types';

export function splitUnits(text: string, mode: SplitMode): string[] {
  const trimmed = text.trim();
  switch (mode) {
    case 'word':
      return trimmed.split(/\s+/).filter(Boolean);
    case 'line':
      return trimmed
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(Boolean);
    case 'phrase': {
      const parts = trimmed
        .split(/[;,—–]/)
        .map(t => t.trim())
        .filter(Boolean);
      return parts.length > 1 ? parts : splitUnits(trimmed, 'sentence');
    }
    case 'sentence':
      return trimmed
        .replace(/\r?\n/g, ' ')
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(Boolean);
    case 'paragraph': {
      const parts = trimmed
        .replace(/\r\n/g, '\n')
        .split(/\n{2,}/)
        .map(t => t.trim())
        .filter(Boolean);
      return parts.length > 1 ? parts : trimmed ? [trimmed] : [];
    }
    case 'full':
    default:
      return trimmed ? [trimmed] : [];
  }
}
