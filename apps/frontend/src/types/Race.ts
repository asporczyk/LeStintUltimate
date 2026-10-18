// A block of real clock hours ("HH:MM") a driver can drive; empty = from the start / to the end.
// A driver can have several blocks, one entry each.
export interface DriverAvailability {
  driver: string
  from: string
  to: string
}

// Pace of a driver; an unset (or 0) field falls back to the race's average.
export interface DriverPace {
  driver: string
  avgLapTime?: number
  avgFuelPerLap?: number
}

export interface Race {
  _id: string
  name: string
  createdAt: Date
  startDate: Date
  startTime: string
  raceLength: number
  drivers: string[]
  driverAvailability?: DriverAvailability[]
  driverPace?: DriverPace[]
  tireSets: number
  fuelTankCapacity: number
  // Seconds lost driving through the pit lane; missing on races saved before it existed.
  pitLaneTime?: number
  avgLapTime: number
  avgFuelPerLap: number
  avgStintTime: number
  notes?: string
}
