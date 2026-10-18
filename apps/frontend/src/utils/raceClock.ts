const toSeconds = (clock: string) => {
  const [h, m, s = 0] = clock.split(':').map(Number)
  return h * 3600 + m * 60 + s
}

const pad = (n: number) => String(n).padStart(2, '0')

// Race times are minutes of real time from the start, while hours people pick and read are
// wall clock times. They differ by an hour after the clocks change (summer/winter time)
// during the race, so moving between them goes through real moments in local time.

// Local moment of the wall clock time `minutes` after the event start (race.startTime on
// race.startDate). E.g. 08:00 the next morning is 12 h 30 min after 19:30 by the clock, but
// 13 h 30 min of real time when the clocks go back overnight.
// - eventDate: race.startDate, a date-only value stored as UTC midnight
export function eventClockDateTime(eventDate: string | Date, eventStartClock: string, minutes: number): Date {
  const date = new Date(eventDate)
  // Date normalizes seconds past 23:59:59 into the next day, by the wall clock.
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, toSeconds(eventStartClock) + Math.round(minutes * 60))
}

// Exact moment the race (first stint) starts, in local time.
// - eventDate: race.startDate, a date-only value stored as UTC midnight
// - eventStartTime: race.startTime, when the race day starts (training)
// - raceStartTime: race start after training and qualification ("HH:MM"),
//   which can fall after midnight, i.e. on the next calendar day
export function raceStartDateTime(eventDate: string | Date, eventStartTime: string, raceStartTime: string): Date {
  // Training + qualification take less than a day, so the forward clock distance is the offset.
  const offset = (((toSeconds(raceStartTime) - toSeconds(eventStartTime)) % 86400) + 86400) % 86400
  return eventClockDateTime(eventDate, eventStartTime, offset / 60)
}

// Whole minutes since the race started (negative before the start).
export function minutesSinceRaceStart(raceStart: Date, now: Date = new Date()): number {
  return Math.floor((now.getTime() - raceStart.getTime()) / 60000)
}

// Wall clock ("HH:MM:SS", local time) `minutes` of real time after the race start, rounded
// to whole seconds. After the clocks change it is an hour off plain clock arithmetic.
export function clockAt(raceStart: Date, minutes: number): string {
  const moment = new Date(raceStart.getTime() + Math.round(minutes * 60) * 1000)
  return `${pad(moment.getHours())}:${pad(moment.getMinutes())}:${pad(moment.getSeconds())}`
}

export interface ClockChange {
  // Race minutes when the clocks change.
  minute: number
  // The clock just then, before and after the change ("HH:MM"), e.g. "03:00" → "02:00".
  from: string
  to: string
}

const MAX_CLOCK_CHANGE_MINUTES = 48 * 60

// Clock changes (summer/winter time) in the first `minutes` of the race, in local time.
export function clockChanges(raceStart: Date, minutes: number): ClockChange[] {
  const begin = raceStart.getTime()
  // Capped at two days: races last up to 24 h, and the loop below runs once per hour.
  const end = begin + Math.min(Math.max(0, minutes), MAX_CLOCK_CHANGE_MINUTES) * 60000
  const offsetAt = (time: number) => new Date(time).getTimezoneOffset()
  const changes: ClockChange[] = []
  // Changes are hours or more apart, so an hour can hold at most one.
  for (let from = begin; from < end; from += 3600000) {
    const to = Math.min(from + 3600000, end)
    const before = offsetAt(from)
    if (offsetAt(to) === before) continue
    // First millisecond with the new offset.
    let lo = from
    let hi = to
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2)
      if (offsetAt(mid) === before) lo = mid
      else hi = mid
    }
    // Clock reading under the old offset: UTC fields of the moment shifted by it.
    const old = new Date(hi - before * 60000)
    const now = new Date(hi)
    changes.push({
      minute: (hi - begin) / 60000,
      from: `${pad(old.getUTCHours())}:${pad(old.getUTCMinutes())}`,
      to: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    })
  }
  return changes
}
