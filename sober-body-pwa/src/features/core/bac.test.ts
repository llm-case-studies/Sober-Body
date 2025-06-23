import { describe, it, expect } from 'vitest'
import { gramsFromDrink, widmark, estimateBAC, hoursToSober, DEFAULT_BETA } from './bac.ts'

describe('BAC core utilities', () => {
  it('calculates grams of ethanol from a drink', () => {
    const drink = { volumeMl: 330, abv: 0.05, date: new Date('2025-01-01T00:00:00Z') }
    const expected = 330 * 0.05 * 0.789
    expect(gramsFromDrink(drink)).toBeCloseTo(expected)
  })

  it('computes a Widmark estimate for a single drink', () => {
    const grams = 10
    const physiology = { weightKg: 70, sex: 'm' } as const
    const hours = 1
    const r = 0.68
    const expected = Math.max((grams / (physiology.weightKg * r)) * 100 - DEFAULT_BETA * hours, 0)
    expect(widmark(grams, physiology, hours)).toBeCloseTo(expected)
  })

  it('aggregates BAC across multiple drinks', () => {
    const start = new Date('2025-01-01T00:00:00Z')
    const drink1 = { volumeMl: 200, abv: 0.1, date: start }
    const drink2 = { volumeMl: 100, abv: 0.1, date: new Date(start.getTime() + 3600 * 1000) }
    const physiology = { weightKg: 70, sex: 'm' } as const

    const dens = 0.789
    const r = 0.68
    const g1 = drink1.volumeMl * drink1.abv * dens
    const g2 = drink2.volumeMl * drink2.abv * dens
    let bac = (g1 / (physiology.weightKg * r)) * 100
    bac = Math.max(bac - DEFAULT_BETA * 1, 0)
    bac += (g2 / (physiology.weightKg * r)) * 100
    bac = Math.max(bac - DEFAULT_BETA * 1, 0)

    const expected = bac
    const at = new Date(start.getTime() + 2 * 3600 * 1000)
    expect(estimateBAC([drink1, drink2], physiology, at)).toBeCloseTo(expected)
  })

  it('computes hours to reach a target BAC', () => {
    const physiology = { weightKg: 70, sex: 'm' } as const
    const expected = (0.08 - 0.02) / DEFAULT_BETA
    expect(hoursToSober(0.08, physiology, 0.02)).toBeCloseTo(expected)
  })
})
