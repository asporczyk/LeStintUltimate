import { calculatePitstopTime } from 'utils/pitstop'
import { stintStartTimes } from 'utils/schedule'
import { penaltyPauses, type PenaltyPause } from 'utils/penalties'
import { fullLaps, lapSecondsOf, lapsAfter, minutesForLaps } from 'utils/laps'
import { type Stint } from 'types/Schedule'

// avgLapTime: the lap time the stint is driven at (utils/pace); unset = the race's.
type TimelineInput = Pick<Stint, 'duration' | 'driver' | 'fuel' | 'tireFL' | 'tireFR' | 'tireRL' | 'tireRR' | 'repairs' | 'avgLapTime' | 'penalties'>

// Stint durations are planned in whole minutes.
const PLAN_PRECISION = 1

// All times are minutes from the race start.
export interface HourMark {
  hour: number
  // Where the hour falls within the stint card, 0 = its start, 1 = its end.
  offset: number
  lap: number
}

// A penalty served in the stint, where it lies on the race clock.
export interface PenaltyMark extends PenaltyPause {
  // Race minute when the car leaves the track for the pit lane.
  at: number
  // Where it falls within the stint card, 0 = its start, 1 = its end.
  offset: number
}

export interface TimelineStint {
  start: number
  // End as driven: the finishing stint ends with the checkered flag.
  end: number
  // Minutes of driving (pit stops excluded) before this stint.
  drivingBefore: number
  // Laps driven before this stint, with the fraction of the lap in progress.
  lapsBefore: number
  startLap: number
  // Seconds per lap in this stint.
  lapSeconds: number
  hourMarks: HourMark[]
  penalties: PenaltyMark[]
  // Minutes the penalties add on the race clock (driving time excludes them).
  penaltyMinutes: number
  // 'after': starts after the checkered flag, so it is never driven.
  status: 'race' | 'finish' | 'after'
}

export interface RaceFinish {
  // Race clock runs out; the lap in progress is the last one.
  timeUpAt: number
  timeUpLap: number
  // Leader crosses the line after the time is up.
  flagAt: number
  totalLaps: number
}

export interface RaceTimeline {
  raceMinutes: number
  stints: TimelineStint[]
  finish: RaceFinish
  plannedEnd: number
  // Minutes of driving in the whole plan (pit stops excluded).
  totalDriving: number
  // Laps driven in the whole plan, with the fraction of the lap in progress.
  plannedLaps: number
  // The plan reaches the checkered flag.
  coversRace: boolean
  // Minutes between the end of the plan and the flag (0 when covered).
  gap: number
  finishingIndex: number
}

// How the plan lies on the race clock: stint times, laps, hour marks and the finish.
// A timed race ends when the leader completes the lap during which the time runs out.
// Laps count driving time only, like the start lap of a stint (pit stops excluded);
// past the end of a short plan the car is assumed to keep driving. Each stint is driven at
// its own lap time; stints without one, and driving past the plan, at `avgLapTime`.
// Penalties stop the driving clock within a stint, like a pit stop between stints: the
// stint drives as many laps, only it ends later.
export function raceTimeline(
  stints: TimelineInput[],
  raceLengthHours: number,
  avgLapTime: number,
  fuelTankCapacity: number,
  pitLaneTime: number = 0,
): RaceTimeline {
  const segments = stints.map(stint => ({ duration: stint.duration, avgLapTime: stint.avgLapTime || avgLapTime }))
  const lapsAt = (driving: number) => lapsAfter(segments, driving, avgLapTime)
  const raceMinutes = Math.max(0, raceLengthHours) * 60
  const starts = stintStartTimes(stints, fuelTankCapacity, pitLaneTime)
  const drivingBefore: number[] = []
  stints.reduce((sum, stint, i) => {
    drivingBefore[i] = sum
    return sum + stint.duration
  }, 0)
  const pauses = stints.map((stint, i) => penaltyPauses(
    stint.penalties,
    { lapsBefore: lapsAt(drivingBefore[i]), lapSeconds: lapSecondsOf(segments[i].avgLapTime), duration: stint.duration },
    pitLaneTime,
  ))
  const penaltyMinutes = pauses.map(list => list.reduce((sum, pause) => sum + pause.minutes, 0))
  const ends = stints.map((stint, i) => starts[i] + stint.duration + penaltyMinutes[i])
  const totalDriving = stints.reduce((sum, stint) => sum + stint.duration, 0)
  const plannedEnd = stints.length ? ends[ends.length - 1] : 0

  // Driving minutes done at a race minute, and where driving resumes after it.
  const drivingAt = (minute: number): { driving: number; resumesAt: number } => {
    for (let i = 0; i < stints.length; i++) {
      if (minute < starts[i]) {
        // In the pit stop before stint i.
        return { driving: drivingBefore[i], resumesAt: starts[i] }
      }
      if (minute < ends[i]) {
        // Minutes on the clock since the stint start, less the penalties served by then.
        let served = 0
        for (const pause of pauses[i]) {
          const pauseStart = starts[i] + pause.driving + served
          if (minute < pauseStart) break
          if (minute < pauseStart + pause.minutes) {
            return { driving: drivingBefore[i] + pause.driving, resumesAt: pauseStart + pause.minutes }
          }
          served += pause.minutes
        }
        return { driving: drivingBefore[i] + minute - starts[i] - served, resumesAt: minute }
      }
    }
    return { driving: totalDriving + minute - plannedEnd, resumesAt: minute }
  }

  const timeUp = drivingAt(raceMinutes)
  const totalLaps = Math.floor(lapsAt(timeUp.driving)) + 1
  const flagDriving = minutesForLaps(segments, totalLaps, avgLapTime)
  // Penalties served on the last lap hold up the flag too.
  const lastLapPenalties = pauses
    .flatMap((list, i) => list.map(pause => ({ ...pause, driving: drivingBefore[i] + pause.driving })))
    .filter(pause => pause.driving > timeUp.driving && pause.driving < flagDriving)
    .reduce((sum, pause) => sum + pause.minutes, 0)
  const flagAt = timeUp.resumesAt + flagDriving - timeUp.driving + lastLapPenalties

  let finishingIndex = -1
  starts.forEach((start, i) => {
    if (start < flagAt) finishingIndex = i
  })
  // Durations are whole minutes, so a plan ending less than a minute before the flag
  // is as close as it gets: its last stint simply drives on to the flag.
  const coversRace = finishingIndex >= 0 && ends[finishingIndex] > flagAt - PLAN_PRECISION

  const timelineStints = stints.map((_, i): TimelineStint => {
    const status = i > finishingIndex ? 'after' : i === finishingIndex && coversRace ? 'finish' : 'race'
    const start = starts[i]
    const end = status === 'finish' ? flagAt : ends[i]
    const nextStart = i + 1 < stints.length ? starts[i + 1] : end
    const hourMarks: HourMark[] = []
    if (status !== 'after') {
      for (let hour = 1; hour * 60 < raceMinutes; hour++) {
        const minute = hour * 60
        // Hours that fall into the pit stop after the stint sit at its end.
        if (minute < start || minute >= Math.max(end, nextStart)) continue
        const offset = Math.min(1, (minute - start) / (end - start))
        hourMarks.push({ hour, offset, lap: Math.floor(lapsAt(drivingAt(minute).driving)) })
      }
    }
    // Penalties after the flag are never served.
    let served = 0
    const penalties: PenaltyMark[] = []
    pauses[i].forEach(pause => {
      const at = start + pause.driving + served
      served += pause.minutes
      if (status === 'after' || at >= end) return
      penalties.push({ ...pause, at, offset: Math.min(1, (at - start) / (end - start)) })
    })
    return {
      start,
      end,
      drivingBefore: drivingBefore[i],
      lapsBefore: lapsAt(drivingBefore[i]),
      startLap: fullLaps(lapsAt(drivingBefore[i])),
      lapSeconds: lapSecondsOf(segments[i].avgLapTime),
      hourMarks,
      penalties,
      penaltyMinutes: penaltyMinutes[i],
      status,
    }
  })

  return {
    raceMinutes,
    stints: timelineStints,
    finish: { timeUpAt: raceMinutes, timeUpLap: totalLaps, flagAt, totalLaps },
    plannedEnd,
    totalDriving,
    plannedLaps: lapsAt(totalDriving),
    coversRace,
    gap: coversRace ? 0 : Math.max(0, flagAt - plannedEnd),
    finishingIndex,
  }
}

// Minutes a new stint at the end of the plan has until the checkered flag, counting the
// pit stop before it (driver change, full tank).
export function newStintMinutesToFlag(timeline: RaceTimeline, lastStint: TimelineInput | null, fuelTankCapacity: number, pitLaneTime: number = 0): number {
  const pitMinutes = lastStint
    ? calculatePitstopTime(lastStint, { ...lastStint, driver: `${lastStint.driver}-next`, fuel: 100, repairs: [] }, fuelTankCapacity, pitLaneTime) / 60
    : 0
  return timeline.finish.flagAt - timeline.plannedEnd - pitMinutes
}

// Longest new stint (whole minutes) that still ends by the checkered flag. 0 once the plan
// covers the race.
export function maxNewStintDuration(timeline: RaceTimeline, lastStint: TimelineInput | null, fuelTankCapacity: number, pitLaneTime: number = 0): number {
  if (timeline.coversRace) return 0
  return Math.max(0, Math.ceil(newStintMinutesToFlag(timeline, lastStint, fuelTankCapacity, pitLaneTime)))
}

// Laps of fuel kept in the tank on top of what the last stint needs.
export const FUEL_RESERVE_LAPS = 1

export interface FinishFuel {
  // Laps the final stint drives to the checkered flag (a started lap counts in full).
  laps: number
  // Smallest refuel (% of the tank) that covers those laps plus the reserve.
  fuel: number
  // The stint runs to the flag once its duration is longer than this (minutes), the same
  // one-minute precision the timeline uses for a complete plan.
  minDuration: number
}

// Fuel for the stint that drives on to the flag, starting after `lapsDone` laps (with the
// fraction of the lap in progress) and `minutesToFlag` before the flag: a new stint at the
// end of the plan or the finishing one. avgFuelPerLap is the stint's own.
export function finishFuel(
  timeline: RaceTimeline,
  lapsDone: number,
  minutesToFlag: number,
  avgFuelPerLap: number,
): FinishFuel | null {
  if (avgFuelPerLap <= 0) return null
  const laps = Math.max(1, Math.ceil(timeline.finish.totalLaps - lapsDone - 1e-9))
  return {
    laps,
    fuel: Math.min(100, Math.ceil((laps + FUEL_RESERVE_LAPS) * avgFuelPerLap - 1e-9)),
    minDuration: minutesToFlag - PLAN_PRECISION,
  }
}

export interface FuelRange {
  // Whole laps the fuel lasts.
  laps: number
  // Longest stint (whole minutes) that stays within those laps.
  minutes: number
}

// How long a stint can run on its fuel (% of the tank). The car can't reach the pit lane
// below 0 % VE, so only whole laps of fuel count, and the lap in progress when the time
// runs out is driven in full. avgFuelPerLap and avgLapTime are the stint's own.
export function fuelRange(fuel: number, avgFuelPerLap: number, avgLapTime: number): FuelRange | null {
  if (avgFuelPerLap <= 0 || fuel <= 0) return null
  const laps = Math.floor(fuel / avgFuelPerLap + 1e-9)
  return { laps, minutes: Math.floor((laps * lapSecondsOf(avgLapTime)) / 60 + 1e-9) }
}

// Longest duration (whole minutes) for an existing stint. The stint that drives to the
// flag, or the last one, may only reach the flag; earlier stints may use the time the
// plan has left. With a full plan they can still grow: the finishing stint gets shorter.
export function maxStintDuration(timeline: RaceTimeline, index: number, duration: number): number | null {
  const stint = timeline.stints[index]
  if (!stint) return null
  const isLast = index === timeline.stints.length - 1
  if (index === timeline.finishingIndex || isLast) {
    return Math.max(0, Math.ceil(timeline.finish.flagAt - stint.start - stint.penaltyMinutes))
  }
  if (!timeline.coversRace) {
    return duration + Math.ceil(timeline.gap)
  }
  return null
}

// Race minutes as "H:MM", e.g. 76 -> "1:16".
export function formatRaceTime(minutes: number): string {
  const total = Math.max(0, Math.round(minutes))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
