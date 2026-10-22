import { describe, expect, it } from 'vitest'
import { finishFuel, formatRaceTime, fuelRange, maxNewStintDuration, maxStintDuration, raceTimeline } from 'utils/raceTimeline'

// Same driver and no refuelling, so the pit stops are short and easy to count.
const stint = (duration: number, driver = 'Adam', fuel = 1) => ({
  duration, driver, fuel, tireFL: '-', tireFR: '-', tireRL: '-', tireRR: '-',
})
// Refuelling 0 % still costs the nozzle and delay: 3.9 s.
const PIT = 3.9 / 60

describe('raceTimeline', () => {
  it('finishes on the lap during which the time runs out', () => {
    // 1 h race, 100 s laps. The pit stop costs a few seconds of driving, so only
    // 35 laps are done at 60:00 and the flag falls after lap 36.
    const timeline = raceTimeline([stint(30), stint(40)], 1, 100, 100)
    expect(timeline.finish.timeUpLap).toBe(36)
    expect(timeline.finish.totalLaps).toBe(36)
    expect(timeline.finish.flagAt).toBeCloseTo(60 + (36 * 100 - (60 - PIT) * 60) / 60)
  })

  it('ends the finishing stint at the flag and marks later stints as after the race', () => {
    const timeline = raceTimeline([stint(30), stint(40), stint(20)], 1, 100, 100)
    expect(timeline.coversRace).toBe(true)
    expect(timeline.finishingIndex).toBe(1)
    expect(timeline.stints[1].status).toBe('finish')
    expect(timeline.stints[1].end).toBeCloseTo(timeline.finish.flagAt)
    expect(timeline.stints[2].status).toBe('after')
    expect(timeline.gap).toBe(0)
  })

  it('lets the last stint drive on to the flag when less than a minute is missing', () => {
    // Flag at 61:40 (36 laps of 100 s, no pit stops); the plan ends 20 s earlier.
    const timeline = raceTimeline([stint(61 + 20 / 60)], 1, 100, 100)
    expect(timeline.coversRace).toBe(true)
    expect(timeline.gap).toBe(0)
    expect(timeline.stints[0].status).toBe('finish')
    expect(timeline.stints[0].end).toBeCloseTo(61 + 40 / 60)
    expect(maxNewStintDuration(timeline, stint(61), 100)).toBe(0)
  })

  it('reports the uncovered time when the plan is short', () => {
    const timeline = raceTimeline([stint(30)], 1, 100, 100)
    expect(timeline.coversRace).toBe(false)
    expect(timeline.stints[0].status).toBe('race')
    // Driving continues after the plan: 36 laps at 60:00, flag at 61:40.
    expect(timeline.finish.flagAt).toBeCloseTo(61 + 40 / 60)
    expect(timeline.gap).toBeCloseTo(31 + 40 / 60)
  })

  it('places hour marks inside the stint where the hour falls', () => {
    const timeline = raceTimeline([stint(50), stint(60), stint(80)], 2, 120, 100)
    expect(timeline.stints[0].hourMarks).toEqual([])
    const [mark] = timeline.stints[1].hourMarks
    expect(mark.hour).toBe(1)
    expect(mark.offset).toBeCloseTo((60 - 50 - PIT) / 60)
    // 60 - PIT minutes of driving at 120 s per lap.
    expect(mark.lap).toBe(29)
  })

  it('counts start laps from driving time, like the backend', () => {
    const timeline = raceTimeline([stint(40), stint(40), stint(40)], 3, 225.5, 100)
    expect(timeline.stints.map(s => s.startLap)).toEqual([0, 10, 21])
  })

  it('treats an empty plan as fully uncovered', () => {
    const timeline = raceTimeline([], 1, 120, 100)
    expect(timeline.finishingIndex).toBe(-1)
    expect(timeline.finish.totalLaps).toBe(31)
    expect(timeline.gap).toBeCloseTo(62)
  })
})

describe('raceTimeline with penalties', () => {
  const PIT_LANE = 25
  const drive = { type: 'driveThrough' as const, lap: 6 }
  const stopGo = { type: 'stopAndGo' as const, lap: 12, stopSeconds: 10 }
  // Pit stop between stints with the race's pit lane: nozzle and delay plus the lane.
  const pitWithLane = (3.9 + PIT_LANE) / 60

  it('makes the stint end later by the time lost, with the same driving time', () => {
    const plain = raceTimeline([stint(30), stint(30)], 2, 100, 100, PIT_LANE)
    const penalized = raceTimeline([{ ...stint(30), penalties: [drive, stopGo] }, stint(30)], 2, 100, 100, PIT_LANE)
    const lost = (25 + 25 + 10) / 60
    expect(penalized.stints[0].penaltyMinutes).toBeCloseTo(lost)
    expect(penalized.stints[0].end).toBeCloseTo(30 + lost)
    expect(penalized.stints[1].start).toBeCloseTo(30 + lost + pitWithLane)
    expect(penalized.stints[1].startLap).toBe(plain.stints[1].startLap)
    expect(penalized.totalDriving).toBe(plain.totalDriving)
    expect(penalized.plannedEnd).toBeCloseTo(plain.plannedEnd + lost)
  })

  it('places each penalty on the clock at its lap, after the ones before it', () => {
    const timeline = raceTimeline([{ ...stint(30), penalties: [stopGo, drive] }], 2, 100, 100, PIT_LANE)
    const [first, second] = timeline.stints[0].penalties
    // Lap 6 of 100 s = 10 min of driving; lap 12 = 20 min, after the 25 s drive through.
    expect(first).toMatchObject({ penalty: drive, index: 1 })
    expect(first.at).toBeCloseTo(10)
    expect(second).toMatchObject({ penalty: stopGo, index: 0 })
    expect(second.at).toBeCloseTo(20 + 25 / 60)
    expect(second.offset).toBeCloseTo((20 + 25 / 60) / (30 + 60 / 60))
  })

  it('stops the lap count while the penalty is served', () => {
    // 1 h race of one stint; a drive through after 30 min. The hour mark comes 25 s of
    // driving earlier, so on the same lap or one earlier than without it.
    const plain = raceTimeline([stint(90)], 2, 100, 100, PIT_LANE)
    const penalized = raceTimeline([{ ...stint(90), penalties: [{ type: 'driveThrough' as const, lap: 18 }] }], 2, 100, 100, PIT_LANE)
    expect(plain.stints[0].hourMarks[0].lap).toBe(36)
    expect(penalized.stints[0].hourMarks[0].lap).toBe(35)
  })

  it('moves the flag when the penalty is served after the time is up', () => {
    // 1 h race, 100 s laps: time up on lap 37 (36 done), flag after 37 laps at 61:40.
    const plain = raceTimeline([stint(70)], 1, 100, 100, PIT_LANE)
    const late = raceTimeline([{ ...stint(70), penalties: [{ type: 'driveThrough' as const, lap: 36 }] }], 1, 100, 100, PIT_LANE)
    expect(late.finish.totalLaps).toBe(plain.finish.totalLaps)
    expect(late.finish.flagAt).toBeCloseTo(plain.finish.flagAt + 25 / 60)
  })

  it('leaves out penalties of stints after the flag', () => {
    const timeline = raceTimeline([stint(70), { ...stint(30), penalties: [drive] }], 1, 100, 100, PIT_LANE)
    expect(timeline.stints[1].status).toBe('after')
    expect(timeline.stints[1].penalties).toEqual([])
  })

  it('lets the finishing stint reach the flag, penalties excluded', () => {
    const timeline = raceTimeline([{ ...stint(70), penalties: [drive] }], 1, 100, 100, PIT_LANE)
    expect(maxStintDuration(timeline, 0, 70)).toBe(Math.ceil(timeline.finish.flagAt - 25 / 60))
  })
})

describe('maxNewStintDuration', () => {
  it('leaves room for the pit stop before the new stint', () => {
    const stints = [stint(30)]
    const timeline = raceTimeline(stints, 1, 100, 100)
    // Driver change (46 s) and a full tank (100 L at 3 L/s + 3.9 s) => 37.2 s.
    expect(maxNewStintDuration(timeline, stints[0], 100)).toBe(Math.ceil(timeline.finish.flagAt - 30 - 46 / 60))
  })

  it('allows nothing once the plan reaches the flag', () => {
    const stints = [stint(30), stint(40)]
    expect(maxNewStintDuration(raceTimeline(stints, 1, 100, 100), stints[1], 100)).toBe(0)
  })
})

describe('maxStintDuration', () => {
  it('lets the finishing stint reach the flag only', () => {
    const timeline = raceTimeline([stint(30), stint(40)], 1, 100, 100)
    expect(maxStintDuration(timeline, 1, 40)).toBe(Math.ceil(timeline.finish.flagAt - timeline.stints[1].start))
  })

  it('lets an earlier stint use the uncovered time', () => {
    const timeline = raceTimeline([stint(20), stint(20)], 1, 100, 100)
    expect(maxStintDuration(timeline, 0, 20)).toBe(20 + Math.ceil(timeline.gap))
  })

  it('does not limit earlier stints when the plan is full', () => {
    const timeline = raceTimeline([stint(30), stint(40)], 1, 100, 100)
    expect(maxStintDuration(timeline, 0, 30)).toBeNull()
  })
})

describe('raceTimeline with lap times per stint', () => {
  it('drives each stint at its own lap time', () => {
    // 2 h race, stint 1 at 120 s (25 laps in 50 min), stint 2 at 100 s (30 laps in 50 min).
    const timeline = raceTimeline([{ ...stint(50), avgLapTime: 120 }, { ...stint(50), avgLapTime: 100 }, stint(30)], 2, 110, 100)
    expect(timeline.stints.map(s => s.startLap)).toEqual([0, 25, 55])
    expect(timeline.stints.map(s => s.lapSeconds)).toEqual([120, 100, 110])
    expect(timeline.plannedLaps).toBeCloseTo(55 + (30 * 60) / 110)
  })

  it('finishes on the lap during which the time runs out, at the lap time of that stint', () => {
    // 1 h race: stint 2 at 90 s. 15 laps in stint 1, then (30 - PIT) min at 90 s = 19.96 laps.
    const timeline = raceTimeline([{ ...stint(30), avgLapTime: 120 }, { ...stint(40), avgLapTime: 90 }], 1, 110, 100)
    expect(timeline.finish.totalLaps).toBe(35)
    // The flag falls when lap 35 is done: 20 laps into stint 2.
    expect(timeline.finish.flagAt).toBeCloseTo(timeline.stints[1].start + (20 * 90) / 60)
  })

  it('drives past a short plan at the race lap time', () => {
    // 30 min at 120 s = 15 laps, then 100 s laps: 15 + 18 = 33 laps at 60:00, flag after 34.
    const timeline = raceTimeline([{ ...stint(30), avgLapTime: 120 }], 1, 100, 100)
    expect(timeline.finish.totalLaps).toBe(34)
    expect(timeline.finish.flagAt).toBeCloseTo(30 + (19 * 100) / 60)
  })
})

describe('finishFuel', () => {
  // 1 h race with 110 s laps: 32.7 laps at 60:00, so the flag falls after lap 33.
  const plan = (duration: number) => raceTimeline([stint(duration)], 1, 110, 100)

  it('fuels the laps left to the flag plus one reserve lap', () => {
    // 50 min planned = 27.3 laps done, so 6 laps to go: (6 + 1) * 3 % = 21 %.
    expect(finishFuel(plan(50), plan(50).plannedLaps, 10, 3)).toEqual({ laps: 6, fuel: 21, minDuration: 9 })
  })

  it('counts a started lap in full and rounds the fuel up', () => {
    // 45 min planned = 24.5 laps done, so 9 laps to go: (9 + 1) * 2.55 % = 25.5 => 26 %.
    expect(finishFuel(plan(45), plan(45).plannedLaps, 15, 2.55)).toMatchObject({ laps: 9, fuel: 26 })
  })

  it('never asks for more than a full tank', () => {
    expect(finishFuel(plan(5), plan(5).plannedLaps, 55, 10)?.fuel).toBe(100)
  })

  it('fuels the finishing stint of a full plan from its own start', () => {
    // Stint 2 starts after 30 min of driving (16.4 laps) and drives to the flag after lap 33.
    const timeline = raceTimeline([stint(30), stint(40)], 1, 110, 100)
    const finishing = timeline.stints[1]
    expect(finishFuel(timeline, finishing.lapsBefore, timeline.finish.flagAt - finishing.start, 3))
      .toMatchObject({ laps: 17, fuel: 54 })
  })

  it('treats a stint ending less than a minute before the flag as running to it', () => {
    // 10.5 min to the flag: the 10 min stint the timeline lets drive on to the flag counts,
    // even though the duration limit rounds up to 11 min.
    const fuel = finishFuel(plan(50), plan(50).plannedLaps, 10.5, 3)
    expect(fuel?.minDuration).toBeCloseTo(9.5)
    expect(10 > fuel!.minDuration).toBe(true)
    expect(9 > fuel!.minDuration).toBe(false)
  })

  it('has nothing to suggest without fuel use', () => {
    expect(finishFuel(plan(50), plan(50).plannedLaps, 10, 0)).toBeNull()
  })
})

describe('formatRaceTime', () => {
  it('formats minutes as H:MM', () => {
    expect(formatRaceTime(76)).toBe('1:16')
    expect(formatRaceTime(360)).toBe('6:00')
  })
})

describe('fuelRange', () => {
  it('reaches the pits on the last drop: 0 % VE is enough', () => {
    // 100 % at 5 %/lap = 20 laps; 20 * 100 s = 33:20 => 33 min.
    expect(fuelRange(100, 5, 100)).toEqual({ laps: 20, minutes: 33 })
  })

  it('counts only whole laps of fuel', () => {
    // 100 % at 4.5 %/lap = 22.2 laps => 22, the 23rd would end below 0 %; 22 * 110 s = 40:20 => 40 min.
    expect(fuelRange(100, 4.5, 110)).toEqual({ laps: 22, minutes: 40 })
  })

  it('drives the lap in progress in full, so the stint never needs more laps', () => {
    const { laps, minutes } = fuelRange(60, 3.7, 97)!
    expect(Math.ceil((minutes * 60) / 97)).toBeLessThanOrEqual(laps)
  })

  it('falls back to 120 s laps', () => {
    expect(fuelRange(50, 10, 0)).toEqual({ laps: 5, minutes: 10 })
  })

  it('needs the fuel use per lap', () => {
    expect(fuelRange(100, 0, 100)).toBeNull()
  })
})
