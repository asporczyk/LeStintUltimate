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

// Car electronics a driver uses; an unset field is not noted.
// Levels 1-9; brakeBias = % of braking force on the front axle (the rear gets the rest);
// rearWing = rear wing angle in degrees, 0 is a real setting.
export interface DriverElectronics {
  driver: string
  abs?: number
  tc?: number
  tcSlip?: number
  tcCut?: number
  brakeBias?: number
  rearWing?: number
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
  driverElectronics?: DriverElectronics[]
  tireSets: number
  fuelTankCapacity: number
  // Seconds lost driving through the pit lane; missing on races saved before it existed.
  pitLaneTime?: number
  avgLapTime: number
  avgFuelPerLap: number
  avgStintTime: number
  notes?: string
}
