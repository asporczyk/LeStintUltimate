// A block of real clock hours ("HH:MM") a driver can drive; empty = from the start / to the end.
// A driver can have several blocks, one entry each.
export interface DriverAvailability {
  driver: string
  from: string
  to: string
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
  tireSets: number
  fuelTankCapacity: number
  avgLapTime: number
  avgFuelPerLap: number
  avgStintTime: number
  notes?: string
}
