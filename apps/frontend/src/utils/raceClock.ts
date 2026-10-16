const toSeconds = (clock: string) => {
  const [h, m, s = 0] = clock.split(':').map(Number)
  return h * 3600 + m * 60 + s
}

// Exact moment the race (first stint) starts, in local time.
// - eventDate: race.startDate, a date-only value stored as UTC midnight
// - eventStartTime: race.startTime, when the race day starts (training)
// - raceStartTime: race start after training and qualification ("HH:MM"),
//   which can fall after midnight, i.e. on the next calendar day
export function raceStartDateTime(eventDate: string | Date, eventStartTime: string, raceStartTime: string): Date {
  const date = new Date(eventDate)
  const eventStart = toSeconds(eventStartTime)
  // Training + qualification take less than a day, so the forward clock distance is the offset.
  const offset = (((toSeconds(raceStartTime) - eventStart) % 86400) + 86400) % 86400
  // Date normalizes seconds past 23:59:59 into the next day.
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, eventStart + offset)
}

// Whole minutes since the race started (negative before the start).
export function minutesSinceRaceStart(raceStart: Date, now: Date = new Date()): number {
  return Math.floor((now.getTime() - raceStart.getTime()) / 60000)
}
