export const DEFAULT_LAP_TIME = 120

// Lap on which a stint starts = full laps completed during all earlier stints
// (the first stint starts on lap 0). Same formula as computeFuelLaps on the backend.
export function stintStartLap(earlierDurations: number[], avgLapTime: number): number {
  const lapTime = avgLapTime > 0 ? avgLapTime : DEFAULT_LAP_TIME
  const minutesBefore = earlierDurations.reduce((sum, duration) => sum + duration, 0)
  return Math.floor(minutesBefore * 60 / lapTime)
}
