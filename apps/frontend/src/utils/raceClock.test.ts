import { describe, expect, it } from 'vitest'
import { minutesSinceRaceStart, raceStartDateTime } from 'utils/raceClock'

const local = (y: number, mo: number, d: number, h: number, mi: number, s = 0) => new Date(y, mo - 1, d, h, mi, s)

describe('raceStartDateTime', () => {
  it('starts on the race date when nothing crosses midnight', () => {
    expect(raceStartDateTime('2026-10-16T00:00:00.000Z', '19:30', '20:25')).toEqual(local(2026, 10, 16, 20, 25))
  })

  it('starts at the event time when there is no training or qualification', () => {
    expect(raceStartDateTime('2026-10-16T00:00:00.000Z', '19:30', '19:30')).toEqual(local(2026, 10, 16, 19, 30))
  })

  it('moves to the next day when training and qualification run past midnight', () => {
    expect(raceStartDateTime('2026-10-16T00:00:00.000Z', '23:30', '00:40')).toEqual(local(2026, 10, 17, 0, 40))
  })

  it('handles the last day of the month and year', () => {
    expect(raceStartDateTime('2026-12-31T00:00:00.000Z', '23:00', '00:15')).toEqual(local(2027, 1, 1, 0, 15))
  })

  it('keeps seconds from HH:MM:SS', () => {
    expect(raceStartDateTime('2026-10-16T00:00:00.000Z', '19:30', '20:25:30')).toEqual(local(2026, 10, 16, 20, 25, 30))
  })

  it('reads the calendar date in UTC, as it is stored', () => {
    // A race created at 00:30 Polish time is stored as 22:30 UTC the day before.
    expect(raceStartDateTime('2026-10-15T22:30:00.000Z', '19:30', '19:30')).toEqual(local(2026, 10, 15, 19, 30))
  })
})

describe('minutesSinceRaceStart', () => {
  const start = local(2026, 10, 16, 23, 0)

  it('is negative before the race, e.g. a week earlier at the same time', () => {
    expect(minutesSinceRaceStart(start, local(2026, 10, 9, 23, 30))).toBeLessThan(0)
  })

  it('counts minutes across midnight', () => {
    expect(minutesSinceRaceStart(start, local(2026, 10, 17, 1, 30))).toBe(150)
  })
})
