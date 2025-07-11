import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import JSZip from 'jszip';
import { createAppDB } from '../../../packages/core-storage/src/db';
import { exportDeckZip } from '../src/exportDeckZip';

describe('deck utils', () => {
  it('exportDeckZip packs deck JSON', async () => {
    const dbInstance = createAppDB('pronun');
    await dbInstance.open();
    await dbInstance.decks.add({ id: '1', title: 'A', lang: 'en', updatedAt: 0, tags: [] });
    await dbInstance.cards.add({ id: 'c1', deckId: '1', text: 'hi' });
    const blob = await exportDeckZip(['1'], () => dbInstance);
    const zip = await JSZip.loadAsync(blob);
    const text = await zip.file('decks/1.json')!.async('string');
    const deck = JSON.parse(text);
    expect(deck.lines).toEqual(['hi']);
  });
});
