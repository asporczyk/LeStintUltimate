import { describe, expect, it } from 'vitest'
import { lapsAfter, minutesForLaps, stintStartLap } from 'utils/laps'

const at = (avgLapTime: number, ...durations: number[]) => durations.map(duration => ({ duration, avgLapTime }))

describe('stintStartLap', () => {
  it('starts the first stint on lap 0', () => {
    expect(stintStartLap([])).toBe(0)
  })

  it('counts full laps completed in earlier stints', () => {
    expect(stintStartLap(at(120, 50))).toBe(25)
    expect(stintStartLap(at(225.5, 50, 50))).toBe(26)
  })

  it('counts laps from the total time, so rounding does not accumulate', () => {
    // 2 x 40 min at 225.5 s: rounding per stint would give 10 + 10 = 20
    expect(stintStartLap(at(225.5, 40, 40))).toBe(21)
  })

  it('drives each stint at its own lap time', () => {
    expect(stintStartLap([{ duration: 50, avgLapTime: 120 }, { duration: 50, avgLapTime: 100 }])).toBe(55)
  })

  it('falls back to 120 s when the lap time is not set', () => {
    expect(stintStartLap(at(0, 50))).toBe(25)
  })
})

describe('lapsAfter and minutesForLaps', () => {
  const segments = [{ duration: 50, avgLapTime: 120 }, { duration: 50, avgLapTime: 100 }]

  it('count laps across segments and past them at the tail lap time', () => {
    expect(lapsAfter(segments, 25, 90)).toBeCloseTo(12.5)
    expect(lapsAfter(segments, 60, 90)).toBeCloseTo(31)
    expect(lapsAfter(segments, 103, 90)).toBeCloseTo(57)
  })

  it('are inverse to each other', () => {
    expect(minutesForLaps(segments, 12.5, 90)).toBeCloseTo(25)
    expect(minutesForLaps(segments, 31, 90)).toBeCloseTo(60)
    expect(minutesForLaps(segments, 57, 90)).toBeCloseTo(103)
  })
})
