import { describe, expect, it } from 'vitest'
import { calculatePitstopTime } from 'utils/pitstop'

const stint = (overrides: Partial<Parameters<typeof calculatePitstopTime>[1]> = {}) => ({
  driver: 'Adam',
  fuel: 100,
  tireFL: '-',
  tireFR: '-',
  tireRL: '-',
  tireRR: '-',
  ...overrides,
})

describe('calculatePitstopTime', () => {
  it('is zero for the first stint', () => {
    expect(calculatePitstopTime(null, stint())).toBe(0)
  })

  it('refuelling only: 99 L / 3 L/s + 3.9 s handling', () => {
    expect(calculatePitstopTime(stint(), stint())).toBeCloseTo(36.9)
  })

  it('scales fuel time with tank capacity', () => {
    expect(calculatePitstopTime(stint(), stint(), 120)).toBeCloseTo(43.5)
  })

  it('runs tires in parallel with refuelling (4 tires = 39 s)', () => {
    expect(calculatePitstopTime(stint(), stint({ fuel: 50, tireFL: 'N', tireFR: 'N', tireRL: 'N', tireRR: 'N' }))).toBeCloseTo(39)
  })

  it('takes as long to fit used or wet tires as new ones', () => {
    expect(calculatePitstopTime(stint(), stint({ fuel: 50, tireFL: 'U', tireFR: 'U', tireRL: 'U', tireRR: 'U' }))).toBeCloseTo(39)
    expect(calculatePitstopTime(stint(), stint({ fuel: 50, tireFL: 'W', tireFR: 'W', tireRL: 'W', tireRR: 'W' }))).toBeCloseTo(39)
  })

  it('takes the longer of fuel and tires (2 tires = 22 s < fuel)', () => {
    expect(calculatePitstopTime(stint(), stint({ tireFL: 'N', tireFR: 'N' }))).toBeCloseTo(36.9)
  })

  it('driver change (46 s) runs in parallel with the rest', () => {
    expect(calculatePitstopTime(stint(), stint({ driver: 'Ola', fuel: 10 }))).toBeCloseTo(46)
  })

  it('repairs follow the tire change, in parallel with refuelling', () => {
    // 4 tires (39 s) + rear wing (40 s) = 79 s > fuel 36.9 s
    expect(calculatePitstopTime(stint(), stint({ tireFL: 'N', tireFR: 'N', tireRL: 'N', tireRR: 'N', repairs: ['rearWing'] }))).toBeCloseTo(79)
  })

  it('adds up repairs of several parts', () => {
    expect(calculatePitstopTime(stint(), stint({ fuel: 10, repairs: ['frontWing', 'suspFL', 'suspFR'] }))).toBeCloseTo(90)
  })

  it('a short repair hides behind refuelling', () => {
    expect(calculatePitstopTime(stint(), stint({ repairs: ['frontWing'] }))).toBeCloseTo(36.9)
  })
})
