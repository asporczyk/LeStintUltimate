export const DEFAULT_LAP_TIME = 120

// Floating point slack, so a lap finished exactly on the minute counts.
const EPSILON = 1e-9

export const lapSecondsOf = (avgLapTime: number) => avgLapTime > 0 ? avgLapTime : DEFAULT_LAP_TIME

// Minutes of driving at one lap time (each stint has its own).
export interface LapSegment {
  duration: number
  avgLapTime: number
}

// Laps driven after `minutes` of driving, with the fraction of the lap in progress. Each
// segment is driven at its own lap time; past the last one at `tailLapTime`.
export function lapsAfter(segments: LapSegment[], minutes: number, tailLapTime: number): number {
  let laps = 0
  let left = minutes
  for (const segment of segments) {
    if (left <= 0) return laps
    const driven = Math.min(left, segment.duration)
    laps += (driven * 60) / lapSecondsOf(segment.avgLapTime)
    left -= driven
  }
  return laps + (Math.max(0, left) * 60) / lapSecondsOf(tailLapTime)
}

// Minutes of driving after which `laps` laps are done: the inverse of lapsAfter.
export function minutesForLaps(segments: LapSegment[], laps: number, tailLapTime: number): number {
  let minutes = 0
  let left = laps
  for (const segment of segments) {
    const lapSeconds = lapSecondsOf(segment.avgLapTime)
    const segmentLaps = (segment.duration * 60) / lapSeconds
    if (left <= segmentLaps) return minutes + (left * lapSeconds) / 60
    minutes += segment.duration
    left -= segmentLaps
  }
  return minutes + (left * lapSecondsOf(tailLapTime)) / 60
}

// Full laps in a number of laps, counting one finished on the minute.
export const fullLaps = (laps: number) => Math.floor(laps + EPSILON)

// Lap on which a stint starts = full laps completed during all earlier stints (the first
// stint starts on lap 0), each at its own lap time. Same formula as computeFuelLaps on the
// backend.
export function stintStartLap(earlier: LapSegment[]): number {
  return fullLaps(earlier.reduce((laps, { duration, avgLapTime }) => laps + (duration * 60) / lapSecondsOf(avgLapTime), 0))
}
