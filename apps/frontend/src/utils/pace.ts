import { type DriverPace } from 'types/Race'
import { formatLapTime, parseLapTime } from 'utils/time'

// Average lap time (s) and fuel per lap (% of the tank); 0 = not set.
export interface Pace {
  avgLapTime: number
  avgFuelPerLap: number
}

export interface RacePace extends Pace {
  driverPace?: DriverPace[]
}

// A stint's own pace; null or 0 = not set.
export interface PaceOverride {
  avgLapTime?: number | null
  avgFuelPerLap?: number | null
}

const firstSet = (...values: (number | null | undefined)[]) =>
  values.find((value): value is number => value != null && value > 0) ?? 0

// Pace a driver drives at: their own values, else the race's.
export function driverPace(race: RacePace, driver: string): Pace {
  const own = race.driverPace?.find(entry => entry.driver === driver)
  return {
    avgLapTime: firstSet(own?.avgLapTime, race.avgLapTime),
    avgFuelPerLap: firstSet(own?.avgFuelPerLap, race.avgFuelPerLap),
  }
}

// Pace of a stint: its own values, else its driver's, else the race's.
export function stintPace(race: RacePace, stint: PaceOverride & { driver?: string }): Pace {
  const inherited = driverPace(race, stint.driver ?? '')
  return {
    avgLapTime: firstSet(stint.avgLapTime, inherited.avgLapTime),
    avgFuelPerLap: firstSet(stint.avgFuelPerLap, inherited.avgFuelPerLap),
  }
}

// Pace as typed in a form: lap time as "M:SS:mmm", fuel in %; empty = not set.
export interface PaceInput {
  avgLapTime: string
  avgFuelPerLap: string
}

export interface PaceInputErrors {
  avgLapTime?: string
  avgFuelPerLap?: string
}

export function paceInput(pace: PaceOverride | undefined): PaceInput {
  return {
    avgLapTime: pace?.avgLapTime ? formatLapTime(pace.avgLapTime) : '',
    avgFuelPerLap: pace?.avgFuelPerLap ? String(pace.avgFuelPerLap) : '',
  }
}

// Validation messages (raceDetails keys) for an optional pace.
export function validatePaceInput(input: PaceInput): PaceInputErrors {
  const errors: PaceInputErrors = {}
  if (input.avgLapTime.trim() && parseLapTime(input.avgLapTime.trim()) === null) {
    errors.avgLapTime = 'validation.lapTimeFormat'
  }
  const fuel = Number(input.avgFuelPerLap)
  if (input.avgFuelPerLap.trim() && (Number.isNaN(fuel) || fuel < 0 || fuel > 100)) {
    errors.avgFuelPerLap = 'validation.fuelPercentRange'
  }
  return errors
}

// A valid input as values; empty fields (and 0) are null = not set.
export function parsePaceInput(input: PaceInput): { avgLapTime: number | null; avgFuelPerLap: number | null } {
  const lapTime = input.avgLapTime.trim() ? parseLapTime(input.avgLapTime.trim()) : null
  const fuel = input.avgFuelPerLap.trim() ? Number(input.avgFuelPerLap) : null
  return { avgLapTime: lapTime || null, avgFuelPerLap: fuel || null }
}
