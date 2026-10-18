import { type Penalty, type PenaltyType } from 'types/Schedule'

// Stop and go: seconds standing in the pit box when the race sets none.
export const DEFAULT_STOP_SECONDS = 10
// Quick picks for the stop in the penalty form.
export const STOP_SECONDS_OPTIONS = [5, 10, 30] as const

// Short names on the rail and the race strip, as the race director calls them.
export const PENALTY_SHORT: Record<PenaltyType, string> = {
  driveThrough: 'DT',
  stopAndGo: 'SG',
}

// Seconds a penalty costs: the pit lane at the speed limit (the race's pitLaneTime) and,
// for a stop and go, the stop in the box.
export function penaltySeconds(penalty: Pick<Penalty, 'type' | 'stopSeconds'>, pitLaneTime: number): number {
  const stop = penalty.type === 'stopAndGo' ? penalty.stopSeconds ?? DEFAULT_STOP_SECONDS : 0
  return Math.max(0, pitLaneTime) + stop
}

// Minutes all penalties of a stint add to it on the race clock.
export function penaltiesMinutes(penalties: Penalty[] | undefined, pitLaneTime: number): number {
  return (penalties ?? []).reduce((sum, penalty) => sum + penaltySeconds(penalty, pitLaneTime), 0) / 60
}

// A penalty within its stint: after how many minutes of driving it is served and how long
// it takes. `index` is its place in the stint's list (to remove it).
export interface PenaltyPause {
  penalty: Penalty
  index: number
  driving: number
  minutes: number
}

// Penalties of a stint in the order they are served, each placed at its lap: the stint
// starts after `lapsBefore` laps and is driven at `lapSeconds`. A lap past the end of the
// stint (e.g. after it was cut short) is served at its end.
export function penaltyPauses(
  penalties: Penalty[] | undefined,
  stint: { lapsBefore: number; lapSeconds: number; duration: number },
  pitLaneTime: number,
): PenaltyPause[] {
  return (penalties ?? [])
    .map((penalty, index) => ({
      penalty,
      index,
      driving: Math.min(stint.duration, Math.max(0, ((penalty.lap - stint.lapsBefore) * stint.lapSeconds) / 60)),
      minutes: penaltySeconds(penalty, pitLaneTime) / 60,
    }))
    .sort((a, b) => a.driving - b.driving || a.index - b.index)
}

// Time a penalty adds, e.g. "+25 s" or "+1:05".
export function formatPenaltyTime(seconds: number): string {
  const total = Math.round(seconds)
  return total < 60 ? `+${total} s` : `+${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
