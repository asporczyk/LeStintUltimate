import { describe, expect, it } from 'vitest'
import { DEFAULT_STOP_SECONDS, formatPenaltyTime, penaltiesMinutes, penaltyPauses, penaltySeconds } from 'utils/penalties'
import { stintStartTimes } from 'utils/schedule'

describe('penaltySeconds', () => {
  it('costs the pit lane for a drive through', () => {
    expect(penaltySeconds({ type: 'driveThrough' }, 25)).toBe(25)
  })

  it('adds the stop for a stop and go, the default one when unset', () => {
    expect(penaltySeconds({ type: 'stopAndGo', stopSeconds: 30 }, 25)).toBe(55)
    expect(penaltySeconds({ type: 'stopAndGo' }, 25)).toBe(25 + DEFAULT_STOP_SECONDS)
  })

  it('sums the penalties of a stint in minutes', () => {
    expect(penaltiesMinutes([{ type: 'driveThrough', lap: 3 }, { type: 'stopAndGo', lap: 9, stopSeconds: 10 }], 25)).toBeCloseTo(1)
    expect(penaltiesMinutes(undefined, 25)).toBe(0)
  })
})

describe('penaltyPauses', () => {
  const stint = { lapsBefore: 20, lapSeconds: 120, duration: 50 }

  it('places each penalty at its lap, in the order they are served', () => {
    const pauses = penaltyPauses([{ type: 'stopAndGo', lap: 30, stopSeconds: 5 }, { type: 'driveThrough', lap: 22 }], stint, 25)
    expect(pauses.map(pause => [pause.index, pause.driving])).toEqual([[1, 4], [0, 20]])
    expect(pauses[1].minutes).toBeCloseTo(0.5)
  })

  it('keeps a penalty within the stint', () => {
    expect(penaltyPauses([{ type: 'driveThrough', lap: 80 }], stint, 25)[0].driving).toBe(50)
    expect(penaltyPauses([{ type: 'driveThrough', lap: 10 }], stint, 25)[0].driving).toBe(0)
  })
})

describe('stintStartTimes with penalties', () => {
  const stint = (penalties?: { type: 'driveThrough'; lap: number }[]) => ({
    duration: 30, driver: 'Adam', fuel: 1, tireFL: '-', tireFR: '-', tireRL: '-', tireRR: '-', penalties,
  })

  it('starts the next stint later by the penalties of the one before', () => {
    const [, plain] = stintStartTimes([stint(), stint()], 100, 25)
    const [, later] = stintStartTimes([stint([{ type: 'driveThrough', lap: 5 }]), stint()], 100, 25)
    expect(later - plain).toBeCloseTo(25 / 60)
  })
})

describe('formatPenaltyTime', () => {
  it('shows seconds under a minute and M:SS above', () => {
    expect(formatPenaltyTime(25)).toBe('+25 s')
    expect(formatPenaltyTime(65)).toBe('+1:05')
  })
})
