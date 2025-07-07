import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import GrammarModal from './GrammarModal'
import type { BriefWithRefs } from '../../../apps/sober-body/src/grammar-loader'

const brief: BriefWithRefs = {
  id: 'b',
  story: 's',
  grammar: {},
  notes: [],
  linkedRefs: [
    { id: 'a', title: 'Pretérito Perfeito', description: '', examples: [] },
    { id: 'b', title: "Futuro com 'ir'", description: '', examples: [] },
    { id: 'c', title: 'Preposição "para"', description: '', examples: [] },
  ],
}

describe('GrammarModal', () => {
  afterEach(() => cleanup())
  it('renders ref titles', () => {
    render(<GrammarModal open brief={brief} onClose={() => {}} />)
    expect(screen.getByText('Pretérito Perfeito')).toBeTruthy()
    expect(screen.getByText("Futuro com 'ir'")).toBeTruthy()
    expect(screen.getByText('Preposição "para"')).toBeTruthy()
  })
})
