import { DRIVER_COLORS } from 'styles/theme'

// Minimum share of race time per driver, by number of drivers.
const MINIMUM_PERCENTAGES: Record<number, number> = {
  2: 25,
  3: 16.7,
  4: 12.5,
  5: 10,
  6: 8.3,
}

export const DRIVER_NAME_MAX_LENGTH = 20
export const MAX_DRIVERS = 20
// One or two words of letters, digits and - _ . ' (same rule as the backend's).
const DRIVER_NAME = /^[\p{L}\p{N}][\p{L}\p{N}_.'-]*( [\p{L}\p{N}_.'-]+)?$/u

export const isValidDriverName = (name: string) =>
  name.length <= DRIVER_NAME_MAX_LENGTH && DRIVER_NAME.test(name)

// A driver name as it is typed: other characters dropped, single spaces, at most two words
// and DRIVER_NAME_MAX_LENGTH characters. A trailing space stays so the second word can follow.
export function sanitizeDriverNameInput(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}_.' -]/gu, '')
    .replace(/\s+/g, ' ')
    .replace(/^ /, '')
    .split(' ')
    .slice(0, 2)
    .join(' ')
    .slice(0, DRIVER_NAME_MAX_LENGTH)
}

export function minimumDriverPercentage(driverCount: number): number {
  return MINIMUM_PERCENTAGES[driverCount] || 100 / driverCount
}

// Driving minutes per driver, longest first. Stints without a driver are skipped.
export function driverTotals(stints: { driver: string; duration: number }[]): [string, number][] {
  const totals = new Map<string, number>()
  for (const stint of stints) {
    if (stint.driver) totals.set(stint.driver, (totals.get(stint.driver) ?? 0) + stint.duration)
  }
  return [...totals].sort(([, a], [, b]) => b - a)
}

// Color of a driver on the race strip and in the driver summary, by their place in the race's
// driver list. Drivers missing from the list share the next free color.
export function driverColor(drivers: string[], driver: string): string {
  const index = drivers.indexOf(driver)
  return DRIVER_COLORS[(index >= 0 ? index : drivers.length) % DRIVER_COLORS.length]
}
