import { type Stint } from 'types/Schedule'
import { request } from 'api/request'

const API_URL = import.meta.env.VITE_API_URL

interface ScheduleResponse {
  schedule: { _id: string; raceId: string; version: number } | null
  stints: Stint[]
}

export const ScheduleApi = {
  getByRaceId: (raceId: string): Promise<ScheduleResponse> => request(`${API_URL}/schedule/${raceId}`),
}
