export const INCIDENT_TYPES = ['weatherChange', 'damage', 'totalDamage'] as const
export type IncidentType = typeof INCIDENT_TYPES[number]

// What cut a stint short, and on which lap (laps completed, like the start lap).
export interface Incident {
  type: IncidentType
  lap: number
}

export const PENALTY_TYPES = ['driveThrough', 'stopAndGo'] as const
export type PenaltyType = typeof PENALTY_TYPES[number]

// Penalty served during a stint: a pass through the pit lane after `lap` laps (laps
// completed, like the start lap), with a stop of `stopSeconds` for a stop and go.
export interface Penalty {
  type: PenaltyType
  lap: number
  stopSeconds?: number
}

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
  // Pace of this stint; unset (null) falls back to the driver's, then the race's.
  avgLapTime?: number | null
  avgFuelPerLap?: number | null
  tireFL: string
  tireFR: string
  tireRL: string
  tireRR: string
  // Parts repaired at the pit stop before the stint (utils/repairs).
  repairs?: string[]
  // Set when the stint was cut short; its duration already ends on the incident's lap.
  // null once removed.
  incident?: Incident | null
  // Served during the stint; it goes on with the same driver, only later on the clock.
  penalties?: Penalty[]
}

export interface Schedule {
  _id: string
  raceId: string
  stints: Stint[]
}

// Payload for creating a stint: the server finds or creates the race's schedule.
export type NewStint = Omit<Stint, '_id' | 'scheduleId'> & { raceId: string }
