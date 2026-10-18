import { describe, expect, it } from 'vitest'
import { scheduleLength, stintStartTimes } from 'utils/schedule'

const stint = (duration: number, driver: string, fuel = 100) => ({
  duration, driver, fuel, tireFL: '-', tireFR: '-', tireRL: '-', tireRR: '-',
})

describe('stintStartTimes', () => {
  it('starts the first stint at 0', () => {
    expect(stintStartTimes([stint(50, 'Adam')], 100)).toEqual([0])
  })

  it('adds the previous stint and the pit stop before each stint', () => {
    // Refuel only (36.9 s), then a driver change (46 s)
    const starts = stintStartTimes([stint(50, 'Adam'), stint(50, 'Adam'), stint(40, 'Ola')], 100)
    expect(starts[1]).toBeCloseTo(50 + 36.9 / 60)
    expect(starts[2]).toBeCloseTo(100 + 36.9 / 60 + 46 / 60)
  })

  it('handles an empty schedule', () => {
    expect(stintStartTimes([], 100)).toEqual([])
    expect(scheduleLength([], 100)).toBe(0)
  })
})

describe('scheduleLength', () => {
  it('is the end of the last stint', () => {
    expect(scheduleLength([stint(50, 'Adam'), stint(40, 'Ola')], 100)).toBeCloseTo(90 + 46 / 60)
  })

  it('counts the pit lane drive-through in every pit stop', () => {
    expect(scheduleLength([stint(50, 'Adam'), stint(40, 'Ola')], 100, 30)).toBeCloseTo(90 + 76 / 60)
  })
})
