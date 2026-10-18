import { describe, expect, it } from 'vitest'
import { durationToLap, incidentLapAt, incidentLapRange, penaltyLapAt, penaltyLapRange, retiredIndex } from 'utils/incidents'
import { stintStartLap } from 'utils/laps'

// Second stint of a plan with 2-minute laps: 50 min driven before, starts on lap 25.
const stint = { start: 51, end: 101, lapsBefore: 25, startLap: 25, lapSeconds: 120, penaltyMinutes: 0 }

describe('incidentLapRange', () => {
  it('runs from the first lap of the stint to the lap it ends on', () => {
    expect(incidentLapRange(stint)).toEqual({ min: 26, max: 50 })
  })

  it('stays valid for a stint shorter than a lap', () => {
    expect(incidentLapRange({ start: 0, end: 1, lapsBefore: 0, startLap: 0, lapSeconds: 120, penaltyMinutes: 0 })).toEqual({ min: 0, max: 0 })
  })
})

describe('penalty laps', () => {
  // The same stint with a 30 s drive through in it: the clock runs longer, the laps don't.
  const penalized = { ...stint, end: 101.5, penaltyMinutes: 0.5 }

  it('runs from the start lap to the lap the stint ends on, penalties excluded', () => {
    expect(penaltyLapRange(penalized)).toEqual({ min: 25, max: 50 })
    expect(incidentLapRange(penalized)).toEqual({ min: 26, max: 50 })
  })

  it('suggests the lap the car is on, within the stint', () => {
    expect(penaltyLapAt(penalized, 51 + 21)).toBe(35)
    expect(penaltyLapAt(penalized, 0)).toBe(25)
    expect(penaltyLapAt(penalized, 300)).toBe(50)
  })
})

describe('incidentLapAt', () => {
  it('is the lap the car is on at that minute', () => {
    expect(incidentLapAt(stint, 51 + 21)).toBe(35)
  })

  it('falls back to the stint range before and after it', () => {
    expect(incidentLapAt(stint, -30)).toBe(26)
    expect(incidentLapAt(stint, 300)).toBe(50)
  })
})

describe('durationToLap', () => {
  it('makes the next stint start on the incident lap', () => {
    const duration = durationToLap(stint, 35)
    expect(duration).toBe(20)
    expect(stintStartLap([{ duration: 50, avgLapTime: 120 }, { duration, avgLapTime: 120 }])).toBe(35)
  })

  it('rounds up to whole minutes with odd lap times', () => {
    const duration = durationToLap({ lapsBefore: (50 * 60) / 95, lapSeconds: 95 }, 40)
    expect(duration).toBe(14)
    expect(stintStartLap([{ duration: 50, avgLapTime: 95 }, { duration, avgLapTime: 95 }])).toBe(40)
  })

  it('uses the lap time of the stint, not of the earlier ones', () => {
    // 25 laps before at 120 s, then 90 s laps: lap 35 after 10 laps = 15 min.
    expect(durationToLap({ lapsBefore: 25, lapSeconds: 90 }, 35)).toBe(15)
  })

  it('is at least a minute', () => {
    expect(durationToLap(stint, 25)).toBe(1)
  })
})

describe('retiredIndex', () => {
  it('finds the stint ended by a total damage', () => {
    expect(retiredIndex([{}, { incident: { type: 'damage', lap: 3 } }, { incident: { type: 'totalDamage', lap: 9 } }, {}])).toBe(2)
    expect(retiredIndex([{ incident: null }, {}])).toBe(-1)
  })
})
