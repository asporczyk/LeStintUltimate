const pad = (n: number, length = 2) => n.toString().padStart(length, '0')

// Clock time ("HH:MM" or "HH:MM:SS") shifted by a number of minutes, rounded to
// whole seconds and wrapping past midnight. Returns "HH:MM:SS".
export function addMinutesToClock(clock: string, minutes: number): string {
  const [h, m, s = 0] = clock.split(':').map(Number)
  const total = (((h * 3600 + m * 60 + s + Math.round(minutes * 60)) % 86400) + 86400) % 86400
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`
}

// Any "HH:MM" or "HH:MM:SS" as "HH:MM:SS", so all tables show the same format.
export function formatClock(clock: string): string {
  return addMinutesToClock(clock, 0)
}

// Minutes as "H:MM", e.g. 125 -> "2:05".
export function formatHoursMinutes(minutes: number): string {
  const total = Math.round(minutes)
  return `${Math.floor(total / 60)}:${pad(total % 60)}`
}

// Lap time in seconds as "M:SS:mmm", e.g. 95.5 -> "1:35:500".
export function formatLapTime(seconds: number): string {
  const totalMs = Math.round(seconds * 1000)
  const mins = Math.floor(totalMs / 60000)
  const secs = Math.floor((totalMs % 60000) / 1000)
  return `${mins}:${pad(secs)}:${pad(totalMs % 1000, 3)}`
}

// Inverse of formatLapTime. Returns null for invalid input.
export function parseLapTime(value: string): number | null {
  const match = value.match(/^(\d+):(\d{1,2}):(\d{1,3})$/)
  if (!match) return null
  const mins = parseInt(match[1], 10)
  const secs = parseInt(match[2], 10)
  const ms = parseInt(match[3].padEnd(3, '0'), 10)
  if (secs >= 60) return null
  return mins * 60 + secs + ms / 1000
}
