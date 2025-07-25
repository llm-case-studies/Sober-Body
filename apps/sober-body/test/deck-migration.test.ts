import { describe, it, expect } from 'vitest'
import { migrateDeck } from '../src/features/games/deck-storage'

describe('migrateDeck', () => {
  it('converts old preset flag to tags', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const old: any = { id: 'x', title: 'Old', lang: 'en', lines: [], preset: true }
    const migrated = migrateDeck(old)
    expect(migrated.tags).toContain('official')
    expect('preset' in migrated).toBe(false)
  })
  it('renames topic tags to cat', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const old: any = { id: 'y', title: 'Y', lang: 'en', lines: [], tags: ['topic:taxi'] }
    const migrated = migrateDeck(old)
    expect(migrated.tags).toContain('cat:taxi')
  })
})
