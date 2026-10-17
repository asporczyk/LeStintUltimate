import { type DriverAvailability } from 'types/Race'
import { availabilityWindows, availableMinutes, driverBlocks, isAvailable } from 'utils/availability'

// Stored as the spotter when no other driver is available during the stint. Only set
// automatically, never offered as a regular choice.
export const NO_SPOTTER = '-'

export interface SpotterOption {
  name: string
  // Available for part of the stint only.
  partial: boolean
}

export interface StintCrew {
  // Drivers available for the whole stint.
  driverOptions: string[]
  // Other drivers available for at least a minute of the stint.
  spotterOptions: SpotterOption[]
  // The chosen driver while still available, else the only one available, else ''.
  driver: string
  // The chosen spotter while still available, else the only one available, else
  // NO_SPOTTER when nobody is, else ''.
  spotter: string
  // The spotter is available for part of the stint only.
  partialSpotter: boolean
}

interface StintCrewInput {
  drivers: string[]
  availability: DriverAvailability[] | undefined
  raceStartClock: string
  // The stint in race minutes.
  start: number
  end: number
  // What the form holds.
  driver: string
  spotter: string
}

// Who can drive and spot a stint, by the drivers' hours, and the choice the form shows:
// a choice no longer available is dropped, a single option is picked automatically.
export function stintCrew({ drivers, availability, raceStartClock, start, end, driver, spotter }: StintCrewInput): StintCrew {
  const windowsOf = (name: string) => availabilityWindows(driverBlocks(availability, name), raceStartClock)

  const driverOptions = drivers.filter(name => isAvailable(windowsOf(name), start, end))
  const resolvedDriver = driverOptions.includes(driver) ? driver : driverOptions.length === 1 ? driverOptions[0] : ''

  const spotterOptions = drivers
    .filter(name => name !== resolvedDriver)
    .flatMap(name => {
      const windows = windowsOf(name)
      const whole = isAvailable(windows, start, end)
      // At least a minute (all of a shorter stint; a zero-length one needs that moment).
      const some = end > start ? availableMinutes(windows, start, end) >= Math.min(1, end - start) : whole
      return some ? [{ name, partial: !whole }] : []
    })

  const names = spotterOptions.map(option => option.name)
  const resolvedSpotter = names.includes(spotter)
    ? spotter
    : names.length === 1 ? names[0] : names.length === 0 ? NO_SPOTTER : ''

  return {
    driverOptions,
    spotterOptions,
    driver: resolvedDriver,
    spotter: resolvedSpotter,
    partialSpotter: spotterOptions.some(option => option.name === resolvedSpotter && option.partial),
  }
}
