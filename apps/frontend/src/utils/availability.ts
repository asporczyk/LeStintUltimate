import { type DriverAvailability } from 'types/Race'
import { eventClockDateTime, raceStartDateTime } from 'utils/raceClock'

type Block = Pick<DriverAvailability, 'from' | 'to'>

// Minutes in race time; the last window runs on past the flag.
export interface AvailabilityWindow {
  start: number
  end: number
}

const DAY = 24 * 60
// Hours of availability are picked in steps of this many minutes.
export const AVAILABILITY_STEP = 15

const clockMinutes = (clock: string) => {
  const [h, m] = clock.split(':').map(Number)
  return h * 60 + m
}

const pad = (n: number) => String(n).padStart(2, '0')
const clockOf = (minutes: number) => {
  const total = ((Math.round(minutes) % DAY) + DAY) % DAY
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
}

// Forward clock distance from the event start (training) to the race start.
export function raceOffset(eventStartClock: string, raceStartClock: string): number {
  return (((clockMinutes(raceStartClock) - clockMinutes(eventStartClock)) % DAY) + DAY) % DAY
}

// An hour of availability: "HH:MM", or "HH:MM+1" for its second time in a session over
// 24 h (e.g. 14:00 on the next day when training starts at 14:00).
function parseHour(value: string): { clock: string; days: number } {
  const [clock, days = '0'] = value.split('+')
  return { clock, days: Number(days) }
}

// Minutes from the event start to an hour of availability: its first time at or after
// the event start, a day later with "+1".
// - `isEnd`: an end equal to the event start means a day later.
export function hourMinute(value: string, eventStartClock: string, isEnd = false): number {
  const { clock, days } = parseHour(value)
  const minute = (((clockMinutes(clock) - clockMinutes(eventStartClock)) % DAY) + DAY) % DAY + days * DAY
  return minute === 0 && isEnd ? DAY : minute
}

// One block of hours in race minutes. No hours: the whole race. Only "from": from then to
// the end. Only "to": from the start until then. Both: from A to B. Hours are real clock
// times counted from the event start, so hours during training and qualification fall
// before the race (negative) instead of on the next day. An end before the start (blocks
// saved before hours were picked from the session) covers the start until B and again A
// to the end.
// - `raceMinute`: race minutes at a clock time given in minutes from the event start
function blockWindows({ from, to }: Block, eventStartClock: string, raceMinute: (clockMinute: number) => number): AvailabilityWindow[] {
  const start = raceMinute(from ? hourMinute(from, eventStartClock) : 0)
  const end = to ? raceMinute(hourMinute(to, eventStartClock, true)) : Infinity
  if (!from || !to || start < end) return [{ start, end }]
  return [{ start: raceMinute(0), end }, { start, end: Infinity }]
}

// When a driver can drive, in race minutes, from their blocks of real clock hours: sorted,
// with overlapping and back-to-back blocks joined. No blocks: the whole race. Hours after
// a clock change during the race (summer/winter time) land on the real moment, e.g. 08:00
// the next morning is an hour later in the race when the clocks go back overnight.
// - eventDate: race.startDate
export function availabilityWindows(
  blocks: Block[],
  eventDate: string | Date,
  eventStartClock: string,
  raceStartClock: string,
): AvailabilityWindow[] {
  if (blocks.length === 0) return [{ start: 0, end: Infinity }]
  const raceStart = raceStartDateTime(eventDate, eventStartClock, raceStartClock).getTime()
  const raceMinute = (clockMinute: number) =>
    (eventClockDateTime(eventDate, eventStartClock, clockMinute).getTime() - raceStart) / 60000
  const windows = blocks
    .flatMap(block => blockWindows(block, eventStartClock, raceMinute))
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

export interface HourOption {
  // Stored value ("HH:MM" or "HH:MM+1").
  value: string
  clock: string
  // Minutes from the event start.
  minute: number
  // Calendar days after the event date.
  day: number
}

// Hours a driver can be available from or to: the event start, then every 15 minutes
// until the race (after training and qualification) is over, with a margin for the last
// lap. `extra` keeps hours saved off that grid. When the clocks change during the race the
// race ends an hour earlier (clocks back) or later (forward) by the clock.
// - eventDate: race.startDate ('' while not picked: no clock change)
export function hourOptions(
  eventDate: string | Date,
  eventStartClock: string,
  raceStartClock: string,
  raceLengthHours: number,
  extra: string[] = [],
): HourOption[] {
  const startClock = clockMinutes(eventStartClock)
  const raceLength = Math.max(0, raceLengthHours) * 60
  const raceStart = eventDate ? raceStartDateTime(eventDate, eventStartClock, raceStartClock) : null
  // Minutes the clocks go back (positive) or forward (negative) during the race; NaN for an
  // invalid date counts as none.
  const clockShift = raceStart
    ? new Date(raceStart.getTime() + raceLength * 60000).getTimezoneOffset() - raceStart.getTimezoneOffset()
    : 0
  const raceEnd = startClock + raceOffset(eventStartClock, raceStartClock) + raceLength - (clockShift || 0)
  const lastClock = Math.ceil(raceEnd / AVAILABILITY_STEP) * AVAILABILITY_STEP + AVAILABILITY_STEP
  const minutes = new Set<number>([0])
  for (let clock = Math.ceil(startClock / AVAILABILITY_STEP) * AVAILABILITY_STEP; clock <= lastClock; clock += AVAILABILITY_STEP) {
    minutes.add(clock - startClock)
  }
  extra.filter(Boolean).forEach(value => minutes.add(hourMinute(value, eventStartClock)))
  return [...minutes].sort((a, b) => a - b).map(minute => {
    const days = Math.floor(minute / DAY)
    const clock = clockOf(startClock + minute)
    return { value: days ? `${clock}+${days}` : clock, clock, minute, day: Math.floor((startClock + minute) / DAY) }
  })
}

// An hour as shown: "HH:MM", with "(+1)" for its second time in the session.
export function formatHour(value: string): string {
  const { clock, days } = parseHour(value)
  return days ? `${clock} (+${days})` : clock
}

// Short text of a driver's hours in session order, e.g. "18:00–22:00, 08:00–12:00",
// "from 22:00", "until 06:00"; null without hours.
export function availabilityLabel(
  blocks: Block[],
  eventStartClock: string,
  t: (key: string, options: Record<string, string>) => string,
): string | null {
  const startOf = ({ from }: Block) => (from ? hourMinute(from, eventStartClock) : 0)
  const labels = blocks
    .filter(({ from, to }) => from || to)
    .sort((a, b) => startOf(a) - startOf(b))
    .map(({ from, to }) => {
      if (from && to) return t('availabilityRange', { from: formatHour(from), to: formatHour(to) })
      if (from) return t('availabilityFrom', { from: formatHour(from) })
      return t('availabilityTo', { to: formatHour(to) })
    })
  return labels.length ? labels.join(', ') : null
}
