export interface Stint {
  _id: string
  scheduleId: string
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
  usedTires: number
  lockedBy?: string
}

export interface Schedule {
  _id: string
  raceId: string
  version: number
  stints: Stint[]
}
