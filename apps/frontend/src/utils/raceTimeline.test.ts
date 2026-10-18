import { describe, expect, it } from 'vitest'
import { finishFuel, formatRaceTime, maxNewStintDuration, maxStintDuration, raceTimeline } from 'utils/raceTimeline'

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
