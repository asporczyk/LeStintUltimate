export interface Race {
  _id: string
  name: string
  createdAt: string | Date
  startDate: string | Date
  startTime: string
  raceLength: number
  drivers: string[]
  tireSets: number
  fuelTankCapacity: number
  avgLapTime: number
  avgFuelPerLap: number
  avgStintTime: number
  notes?: string
}

export interface Stint {
  _id: string
  raceId: string
  order: number
  startTime: number
  duration: number
  driver: string
  spotter: string
  fuelLaps: number
  fuel: number
  tireFL: string
  tireFR: string
  tireRL: string
  tireRR: string
  tires: number
  lockedBy?: string | null
}

export interface Schedule {
  _id: string
  raceId: string
  version: number
}

export interface Qualification {
  _id: string
  raceId: string
  startTime: string
  duration: number
  laps: number
  driver: string
  spotter: string
  fuel: number
  tireFL: string
  tireFR: string
  tireRL: string
  tireRR: string
}

export interface Training {
  _id: string
  raceId: string
  startTime: string
  duration: number
}
