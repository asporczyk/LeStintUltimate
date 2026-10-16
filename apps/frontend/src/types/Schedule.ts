export interface Stint {
  _id: string
  scheduleId: string
  order: number
  duration: number
  durationAuto?: boolean
  driver: string
  spotter: string
  fuelLaps: number
  fuel: number
  tireFL: string
  tireFR: string
  tireRL: string
  tireRR: string
}

export interface Schedule {
  _id: string
  raceId: string
  stints: Stint[]
}

// Payload for creating a stint: the server finds or creates the race's schedule.
export type NewStint = Omit<Stint, '_id' | 'scheduleId'> & { raceId: string }
