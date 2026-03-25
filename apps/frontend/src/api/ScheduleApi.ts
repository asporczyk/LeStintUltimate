import { type Stint } from 'types/Schedule'

const API_URL = import.meta.env.VITE_API_URL

interface ScheduleResponse {
  schedule: { _id: string; raceId: string; version: number } | null
  stints: Stint[]
}

export const ScheduleApi = {
  getByRaceId: async (raceId: string): Promise<ScheduleResponse> => {
    const res = await fetch(`${API_URL}/schedule/${raceId}`)
    return res.json()
  },
}