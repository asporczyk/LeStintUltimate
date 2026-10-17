import { beforeAll, describe, expect, it } from 'vitest'
import { clockAt, clockChanges, raceStartDateTime } from 'utils/raceClock'
import { availabilityWindows, hourOptions } from 'utils/availability'
import { stintCrew } from 'utils/crew'
import { raceTimeline } from 'utils/raceTimeline'

// Clocks change in Poland on the last Sunday of October (03:00 → 02:00) and of March
// (02:00 → 03:00). Race minutes are real time; clocks people read and pick are wall time.
beforeAll(() => {
  process.env.TZ = 'Europe/Warsaw'
})

// 24 h race: event (training) Sat 24.10.2026 12:00, race start 14:00, flag Sun 25.10 ~13:00 CET.
const AUTUMN = '2026-10-24T00:00:00.000Z'
// 24 h race: Sat 27.03.2027 14:00, flag Sun 28.03 ~15:00 CEST.
const SPRING = '2027-03-27T00:00:00.000Z'

describe('clock during a race over the clock change', () => {
  it('reads the wall clock at real moments when clocks go back', () => {
    const start = raceStartDateTime(AUTUMN, '12:00', '14:00')
    expect(clockAt(start, 0)).toBe('14:00:00')
    expect(clockAt(start, 12 * 60)).toBe('02:00:00')
    // An hour later it is 02:00 again.
    expect(clockAt(start, 13 * 60)).toBe('02:00:00')
    expect(clockAt(start, 14 * 60)).toBe('03:00:00')
    expect(clockAt(start, 24 * 60)).toBe('13:00:00')
  })

  it('reads the wall clock at real moments when clocks go forward', () => {
    const start = raceStartDateTime(SPRING, '14:00', '14:00')
    expect(clockAt(start, 11 * 60 + 59)).toBe('01:59:00')
    expect(clockAt(start, 12 * 60)).toBe('03:00:00')
    expect(clockAt(start, 24 * 60)).toBe('15:00:00')
  })

  it('finds the change and both clock readings', () => {
    expect(clockChanges(raceStartDateTime(AUTUMN, '12:00', '14:00'), 24 * 60 + 2))
      .toEqual([{ minute: 780, from: '03:00', to: '02:00' }])
    expect(clockChanges(raceStartDateTime(SPRING, '14:00', '14:00'), 24 * 60 + 2))
      .toEqual([{ minute: 720, from: '02:00', to: '03:00' }])
  })

  it('finds the change for a race start with seconds', () => {
    expect(clockChanges(raceStartDateTime(AUTUMN, '12:00', '14:00:30'), 24 * 60))
      .toEqual([{ minute: 779.5, from: '03:00', to: '02:00' }])
  })

  it('finds no change on other days or before it', () => {
    expect(clockChanges(raceStartDateTime('2026-10-17T00:00:00.000Z', '12:00', '14:00'), 24 * 60)).toEqual([])
    expect(clockChanges(raceStartDateTime(AUTUMN, '12:00', '14:00'), 12 * 60)).toEqual([])
  })

  it('keeps the race start on the wall clock for a race starting after the change', () => {
    // Event 25.10 00:00, race at 04:00 by the clock: 5 h of real time later.
    const start = raceStartDateTime('2026-10-25T00:00:00.000Z', '00:00', '04:00')
    expect(start).toEqual(new Date(2026, 9, 25, 4, 0))
    expect(start.getTime() - new Date(2026, 9, 25, 0, 0).getTime()).toBe(5 * 3600000)
  })
})

describe('driver hours over the clock change', () => {
  const windows = (from: string, to: string) => availabilityWindows([{ from, to }], AUTUMN, '12:00', '14:00')

  it('places hours after the change at their real moment', () => {
    // 08:00–12:00 CET on Sunday is 19–23 h into the race (not 18–22 h).
    expect(windows('08:00', '12:00')).toEqual([{ start: 1140, end: 1380 }])
    // Overnight 18:00–06:00: the night is an hour longer.
    expect(windows('18:00', '06:00')).toEqual([{ start: 240, end: 1020 }])
  })

  it('keeps hours before the change as they were', () => {
    // No "from": since the event start (training at 12:00).
    expect(windows('', '01:00')).toEqual([{ start: -120, end: 660 }])
  })

  it('takes the first 02:30 for the hour that happens twice', () => {
    expect(windows('02:30', '')).toEqual([{ start: 750, end: Infinity }])
  })

  it('places hours after clocks go forward an hour sooner', () => {
    expect(availabilityWindows([{ from: '08:00', to: '' }], SPRING, '14:00', '14:00')).toEqual([{ start: 1020, end: Infinity }])
  })

  it('offers hours until the race is over by the clock', () => {
    // Flag around 13:00 CET; the margin adds one step.
    expect(hourOptions(AUTUMN, '12:00', '14:00', 24).at(-1)?.value).toBe('13:15+1')
    expect(hourOptions(SPRING, '14:00', '14:00', 24).at(-1)?.value).toBe('15:15+1')
    // No date picked yet: plain clock arithmetic.
    expect(hourOptions('', '12:00', '14:00', 24).at(-1)?.value).toBe('14:15+1')
  })

  it('offers drivers by their real hours', () => {
    const crew = (start: number, end: number) => stintCrew({
      drivers: ['Adam', 'Kuba'],
      availability: [{ driver: 'Adam', from: '08:00', to: '12:00' }],
      eventDate: AUTUMN,
      eventStartClock: '12:00',
      raceStartClock: '14:00',
      start,
      end,
      driver: '',
      spotter: '',
    }).driverOptions
    // 07:00–09:00 CET: Adam is not there yet.
    expect(crew(1080, 1200)).toEqual(['Kuba'])
    // 08:00–10:00 CET.
    expect(crew(1140, 1260)).toEqual(['Adam', 'Kuba'])
  })
})

describe('24 h race from 24.10 to 25.10', () => {
  it('shows every stint at the real clock time', () => {
    const start = raceStartDateTime(AUTUMN, '12:00', '14:00')
    // 25 stints of 59 min, same driver, no fuel or tires: short pit stops.
    const stints = Array.from({ length: 25 }, () => ({
      duration: 59, driver: 'Adam', fuel: 0, tireFL: '-', tireFR: '-', tireRL: '-', tireRR: '-',
    }))
    const timeline = raceTimeline(stints, 24, 120, 100)
    const real = (minutes: number) =>
      new Date(start.getTime() + Math.round(minutes * 60) * 1000).toLocaleTimeString('pl-PL', { timeZone: 'Europe/Warsaw' })

    timeline.stints.forEach(stint => {
      expect(clockAt(start, stint.start)).toBe(real(stint.start))
      expect(clockAt(start, stint.end)).toBe(real(stint.end))
    })
    expect(clockAt(start, timeline.finish.timeUpAt)).toBe('13:00:00')
    expect(clockAt(start, timeline.finish.flagAt).slice(0, 5)).toMatch(/^13:0[0-2]$/)
  })
})
