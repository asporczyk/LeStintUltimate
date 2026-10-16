import { calculatePitstopTime } from 'utils/pitstop'
import { stintStartTimes } from 'utils/schedule'
import { DEFAULT_LAP_TIME } from 'utils/laps'
import { type Stint } from 'types/Schedule'

type TimelineInput = Pick<Stint, 'duration' | 'driver' | 'fuel' | 'tireFL' | 'tireFR' | 'tireRL' | 'tireRR'>

// Stint durations are planned in whole minutes.
const PLAN_PRECISION = 1

// All times are minutes from the race start.
export interface HourMark {
  hour: number
  // Where the hour falls within the stint card, 0 = its start, 1 = its end.
  offset: number
  lap: number
}

export interface TimelineStint {
  start: number
  // End as driven: the finishing stint ends with the checkered flag.
  end: number
  // Minutes of driving (pit stops excluded) before this stint.
  drivingBefore: number
  startLap: number
  hourMarks: HourMark[]
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
  // The plan reaches the checkered flag.
  coversRace: boolean
  // Minutes between the end of the plan and the flag (0 when covered).
  gap: number
  finishingIndex: number
}

// How the plan lies on the race clock: stint times, laps, hour marks and the finish.
// A timed race ends when the leader completes the lap during which the time runs out.
// Laps count driving time only, like the start lap of a stint (pit stops excluded);
// past the end of a short plan the car is assumed to keep driving.
export function raceTimeline(
  stints: TimelineInput[],
  raceLengthHours: number,
  avgLapTime: number,
  fuelTankCapacity: number,
): RaceTimeline {
  const lapSeconds = avgLapTime > 0 ? avgLapTime : DEFAULT_LAP_TIME
  const raceMinutes = Math.max(0, raceLengthHours) * 60
  const starts = stintStartTimes(stints, fuelTankCapacity)
  const ends = stints.map((stint, i) => starts[i] + stint.duration)
  const drivingBefore: number[] = []
  stints.reduce((sum, stint, i) => {
    drivingBefore[i] = sum
    return sum + stint.duration
  }, 0)
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
        return { driving: drivingBefore[i] + minute - starts[i], resumesAt: minute }
      }
    }
    return { driving: totalDriving + minute - plannedEnd, resumesAt: minute }
  }

  const timeUp = drivingAt(raceMinutes)
  const lapsAtTimeUp = (timeUp.driving * 60) / lapSeconds
  const totalLaps = Math.floor(lapsAtTimeUp) + 1
  const flagAt = timeUp.resumesAt + (totalLaps * lapSeconds - timeUp.driving * 60) / 60

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
        hourMarks.push({ hour, offset, lap: Math.floor((drivingAt(minute).driving * 60) / lapSeconds) })
      }
    }
    return {
      start,
      end,
      drivingBefore: drivingBefore[i],
      startLap: Math.floor((drivingBefore[i] * 60) / lapSeconds),
      hourMarks,
      status,
    }
  })

  return {
    raceMinutes,
    stints: timelineStints,
    finish: { timeUpAt: raceMinutes, timeUpLap: totalLaps, flagAt, totalLaps },
    plannedEnd,
    totalDriving,
    coversRace,
    gap: coversRace ? 0 : Math.max(0, flagAt - plannedEnd),
    finishingIndex,
  }
}

// Minutes a new stint at the end of the plan has until the checkered flag, counting the
// pit stop before it (driver change, full tank).
export function newStintMinutesToFlag(timeline: RaceTimeline, lastStint: TimelineInput | null, fuelTankCapacity: number): number {
  const pitMinutes = lastStint
    ? calculatePitstopTime(lastStint, { ...lastStint, driver: `${lastStint.driver}-next`, fuel: 100 }, fuelTankCapacity) / 60
    : 0
  return timeline.finish.flagAt - timeline.plannedEnd - pitMinutes
}

// Longest new stint (whole minutes) that still ends by the checkered flag. 0 once the plan
// covers the race.
export function maxNewStintDuration(timeline: RaceTimeline, lastStint: TimelineInput | null, fuelTankCapacity: number): number {
  if (timeline.coversRace) return 0
  return Math.max(0, Math.ceil(newStintMinutesToFlag(timeline, lastStint, fuelTankCapacity)))
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

// Fuel for the stint that drives on to the flag, starting after `drivingBefore` minutes
// of driving and `minutesToFlag` before the flag: a new stint at the end of the plan or
// the finishing one.
export function finishFuel(
  timeline: RaceTimeline,
  drivingBefore: number,
  minutesToFlag: number,
  avgLapTime: number,
  avgFuelPerLap: number,
): FinishFuel | null {
  if (avgFuelPerLap <= 0) return null
  const lapSeconds = avgLapTime > 0 ? avgLapTime : DEFAULT_LAP_TIME
  const lapsDone = (drivingBefore * 60) / lapSeconds
  const laps = Math.max(1, Math.ceil(timeline.finish.totalLaps - lapsDone - 1e-9))
  return {
    laps,
    fuel: Math.min(100, Math.ceil((laps + FUEL_RESERVE_LAPS) * avgFuelPerLap - 1e-9)),
    minDuration: minutesToFlag - PLAN_PRECISION,
  }
}

// Longest duration (whole minutes) for an existing stint. The stint that drives to the
// flag, or the last one, may only reach the flag; earlier stints may use the time the
// plan has left. With a full plan they can still grow: the finishing stint gets shorter.
export function maxStintDuration(timeline: RaceTimeline, index: number, duration: number): number | null {
  const stint = timeline.stints[index]
  if (!stint) return null
  const isLast = index === timeline.stints.length - 1
  if (index === timeline.finishingIndex || isLast) {
    return Math.max(0, Math.ceil(timeline.finish.flagAt - stint.start))
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
