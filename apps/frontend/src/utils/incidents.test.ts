import { describe, expect, it } from 'vitest'
import { durationToLap, incidentLapAt, incidentLapRange, retiredIndex } from 'utils/incidents'
import { stintStartLap } from 'utils/laps'

// Second stint of a plan with 2-minute laps: 50 min driven before, starts on lap 25.
const stint = { start: 51, end: 101, drivingBefore: 50, startLap: 25 }

describe('incidentLapRange', () => {
  it('runs from the first lap of the stint to the lap it ends on', () => {
    expect(incidentLapRange(stint, 120)).toEqual({ min: 26, max: 50 })
  })

  it('stays valid for a stint shorter than a lap', () => {
    expect(incidentLapRange({ start: 0, end: 1, drivingBefore: 0, startLap: 0 }, 120)).toEqual({ min: 0, max: 0 })
  })
})

describe('incidentLapAt', () => {
  it('is the lap the car is on at that minute', () => {
    expect(incidentLapAt(stint, 51 + 21, 120)).toBe(35)
  })

  it('falls back to the stint range before and after it', () => {
    expect(incidentLapAt(stint, -30, 120)).toBe(26)
    expect(incidentLapAt(stint, 300, 120)).toBe(50)
  })
})

describe('durationToLap', () => {
  it('makes the next stint start on the incident lap', () => {
    const duration = durationToLap(50, 35, 120)
    expect(duration).toBe(20)
    expect(stintStartLap([50, duration], 120)).toBe(35)
  })

  it('rounds up to whole minutes with odd lap times', () => {
    const duration = durationToLap(50, 40, 95)
    expect(duration).toBe(14)
    expect(stintStartLap([50, duration], 95)).toBe(40)
  })

  it('is at least a minute', () => {
    expect(durationToLap(50, 25, 120)).toBe(1)
  })
})

describe('retiredIndex', () => {
  it('finds the stint ended by a total damage', () => {
    expect(retiredIndex([{}, { incident: { type: 'damage', lap: 3 } }, { incident: { type: 'totalDamage', lap: 9 } }, {}])).toBe(2)
    expect(retiredIndex([{ incident: null }, {}])).toBe(-1)
  })
})
