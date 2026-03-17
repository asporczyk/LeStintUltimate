export interface Race {
  _id: string
  name: string
  createdAt: Date
  startDate: Date
  raceLength: number
  drivers: string[]
  tireSets: number
  avgLapTime: number
  avgFuelPerLap: number
  avgStintTime: number
}
