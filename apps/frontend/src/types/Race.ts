export interface Qualification {
  startTime?: string
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

export interface Race {
  _id: string
  name: string
  createdAt: Date
  startDate: Date
  startTime: string
  raceLength: number
  drivers: string[]
  tireSets: number
  fuelTankCapacity: number
  avgLapTime: number
  avgFuelPerLap: number
  avgStintTime: number
  notes?: string
  qualification?: Qualification
}
