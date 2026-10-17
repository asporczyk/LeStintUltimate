import { type DriverAvailability } from 'types/Race'

type Block = Pick<DriverAvailability, 'from' | 'to'>

// Minutes in race time; the last window runs on past the flag.
export interface AvailabilityWindow {
  start: number
  end: number
}

const DAY = 24 * 60

const clockMinutes = (clock: string) => {
  const [h, m] = clock.split(':').map(Number)
  return h * 60 + m
}

// Race minute of the first moment after the race start the clock shows `clock`. Races
// last at most 24 h, so every clock time falls on the race once.
// - `atStart`: a time equal to the race start means the start itself (for "from"),
//   otherwise a day later (for "to").
function raceMinuteOf(clock: string, raceStartClock: string, atStart: boolean): number {
  const minute = (((clockMinutes(clock) - clockMinutes(raceStartClock)) % DAY) + DAY) % DAY
  return minute === 0 && !atStart ? DAY : minute
}

// One block of hours in race minutes. No hours: the whole race. Only "from": from then to
// the end. Only "to": from the start until then. Both: from A to B, past midnight when B is
// earlier than A. When the race reaches B before A (e.g. 12:00–18:00 in a race starting at
// 14:00), the block covers the start until B and again A to the end.
function blockWindows({ from, to }: Block, raceStartClock: string): AvailabilityWindow[] {
  const start = from ? raceMinuteOf(from, raceStartClock, true) : 0
  const end = to ? raceMinuteOf(to, raceStartClock, false) : Infinity
  if (!from || !to || start < end) return [{ start, end }]
  return [{ start: 0, end }, { start, end: Infinity }]
}

// When a driver can drive, in race minutes, from their blocks of real clock hours: sorted,
// with overlapping and back-to-back blocks joined. No blocks: the whole race.
export function availabilityWindows(blocks: Block[], raceStartClock: string): AvailabilityWindow[] {
  if (blocks.length === 0) return [{ start: 0, end: Infinity }]
  const windows = blocks
    .flatMap(block => blockWindows(block, raceStartClock))
    .sort((a, b) => a.start - b.start)
  const merged: AvailabilityWindow[] = []
  for (const window of windows) {
    const last = merged[merged.length - 1]
    if (last && window.start <= last.end) last.end = Math.max(last.end, window.end)
    else merged.push({ ...window })
  }
  return merged
}

// A driver's blocks of hours (one entry per block).
export function driverBlocks(availability: DriverAvailability[] | undefined, driver: string): DriverAvailability[] {
  return availability?.filter(entry => entry.driver === driver) ?? []
}

// Whether the driver can drive the whole of [start, end] (race minutes).
export function isAvailable(windows: AvailabilityWindow[], start: number, end: number): boolean {
  return windows.some(window => window.start <= start && end <= window.end)
}

// Minutes of [start, end] (race minutes) the driver can drive.
export function availableMinutes(windows: AvailabilityWindow[], start: number, end: number): number {
  return windows.reduce((sum, window) => sum + Math.max(0, Math.min(end, window.end) - Math.max(start, window.start)), 0)
}

// Short text of a driver's hours in race order, e.g. "18:00–22:00, 08:00–12:00",
// "from 22:00", "until 06:00"; null without hours.
export function availabilityLabel(
  blocks: Block[],
  raceStartClock: string,
  t: (key: string, options: Record<string, string>) => string,
): string | null {
  const startOf = ({ from }: Block) => (from ? raceMinuteOf(from, raceStartClock, true) : 0)
  const labels = blocks
    .filter(({ from, to }) => from || to)
    .sort((a, b) => startOf(a) - startOf(b))
    .map(({ from, to }) => {
      if (from && to) return t('availabilityRange', { from, to })
      if (from) return t('availabilityFrom', { from })
      return t('availabilityTo', { to })
    })
  return labels.length ? labels.join(', ') : null
}
