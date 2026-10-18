import { DEFAULT_LAP_TIME } from 'utils/laps'
import { type Stint } from 'types/Schedule'
import { type TimelineStint } from 'utils/raceTimeline'

type IncidentStint = Pick<TimelineStint, 'start' | 'end' | 'drivingBefore' | 'startLap'>

export interface LapRange {
  min: number
  max: number
}

const lapSecondsOf = (avgLapTime: number) => avgLapTime > 0 ? avgLapTime : DEFAULT_LAP_TIME

// Laps (completed, like the start lap) on which an incident can end the stint: at least
// one lap into it, at most the lap it ends on as planned.
export function incidentLapRange(stint: IncidentStint, avgLapTime: number): LapRange {
  const lapSeconds = lapSecondsOf(avgLapTime)
  const max = Math.floor(((stint.drivingBefore + stint.end - stint.start) * 60) / lapSeconds)
  return { min: Math.min(stint.startLap + 1, max), max }
}

// Lap the car should be on at a race minute, kept within the stint's range: the
// suggestion for an incident reported now.
export function incidentLapAt(stint: IncidentStint, minute: number, avgLapTime: number): number {
  const { min, max } = incidentLapRange(stint, avgLapTime)
  const driven = Math.min(Math.max(minute - stint.start, 0), stint.end - stint.start)
  const lap = Math.floor(((stint.drivingBefore + driven) * 60) / lapSecondsOf(avgLapTime))
  return Math.min(Math.max(lap, min), max)
}

// Whole-minute duration after which the next stint starts on `lap`: the shortest one
// that completes the lap (durations are planned in whole minutes), at least a minute.
export function durationToLap(drivingBefore: number, lap: number, avgLapTime: number): number {
  const minutes = (lap * lapSecondsOf(avgLapTime)) / 60 - drivingBefore
  return Math.max(1, Math.ceil(minutes - 1e-9))
}

// Index of the stint that ended the race with a total damage, or -1.
export function retiredIndex(stints: Pick<Stint, 'incident'>[]): number {
  return stints.findIndex(stint => stint.incident?.type === 'totalDamage')
}
