import { type Stint } from 'types/Schedule'
import { type TimelineStint } from 'utils/raceTimeline'

type IncidentStint = Pick<TimelineStint, 'start' | 'end' | 'lapsBefore' | 'startLap' | 'lapSeconds' | 'penaltyMinutes'>

// Minutes the stint is driven, penalties excluded.
const drivingMinutes = (stint: IncidentStint) => Math.max(0, stint.end - stint.start - stint.penaltyMinutes)

export interface LapRange {
  min: number
  max: number
}

// Laps done (with the fraction of the lap in progress) after `minutes` into the stint,
// at the stint's own lap time.
const lapsInto = (stint: Pick<IncidentStint, 'lapsBefore' | 'lapSeconds'>, minutes: number) =>
  stint.lapsBefore + (minutes * 60) / stint.lapSeconds

// Laps (completed, like the start lap) on which an incident can end the stint: at least
// one lap into it, at most the lap it ends on as planned.
export function incidentLapRange(stint: IncidentStint): LapRange {
  const max = Math.floor(lapsInto(stint, drivingMinutes(stint)) + 1e-9)
  return { min: Math.min(stint.startLap + 1, max), max }
}

// Lap the car should be on at a race minute, kept within the stint's range: the
// suggestion for an incident reported now.
export function incidentLapAt(stint: IncidentStint, minute: number): number {
  const { min, max } = incidentLapRange(stint)
  const driven = Math.min(Math.max(minute - stint.start, 0), drivingMinutes(stint))
  const lap = Math.floor(lapsInto(stint, driven) + 1e-9)
  return Math.min(Math.max(lap, min), max)
}

// Laps on which a penalty can be served: from the stint's start lap to the lap it ends on.
export function penaltyLapRange(stint: IncidentStint): LapRange {
  return { min: stint.startLap, max: Math.max(stint.startLap, incidentLapRange(stint).max) }
}

// Lap the car should be on at a race minute, within the stint's penalty range.
export function penaltyLapAt(stint: IncidentStint, minute: number): number {
  const { min, max } = penaltyLapRange(stint)
  const driven = Math.min(Math.max(minute - stint.start, 0), drivingMinutes(stint))
  return Math.min(Math.max(Math.floor(lapsInto(stint, driven) + 1e-9), min), max)
}

// Whole-minute duration after which the next stint starts on `lap`: the shortest one
// that completes the lap (durations are planned in whole minutes), at least a minute.
export function durationToLap(stint: Pick<IncidentStint, 'lapsBefore' | 'lapSeconds'>, lap: number): number {
  const minutes = ((lap - stint.lapsBefore) * stint.lapSeconds) / 60
  return Math.max(1, Math.ceil(minutes - 1e-9))
}
// Index of the stint that ended the race with a total damage, or -1.
export function retiredIndex(stints: Pick<Stint, 'incident'>[]): number {
  return stints.findIndex(stint => stint.incident?.type === 'totalDamage')
}
