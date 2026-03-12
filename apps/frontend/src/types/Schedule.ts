export interface Stint {
  _id: string
  scheduleId: string
  startTime: number
  duration: number
  driver: string
  fuelLaps: number
  tires: string
  lockedBy?: string
}

export interface Schedule {
  _id: string
  raceId: string
  version: number
  stints: Stint[]
}
