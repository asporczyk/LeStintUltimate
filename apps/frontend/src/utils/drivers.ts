// Minimum share of race time per driver, by number of drivers.
const MINIMUM_PERCENTAGES: Record<number, number> = {
  2: 25,
  3: 16.7,
  4: 12.5,
  5: 10,
  6: 8.3,
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
