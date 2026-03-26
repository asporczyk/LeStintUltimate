export interface Race {
  _id: string
  name: string
  createdAt: Date
  startDate: Date
  startTime: string
  raceLength: number
  drivers: string[]
  tireSets: number
  avgLapTime: number
  avgFuelPerLap: number
  avgStintTime: number
  notes?: string
}
