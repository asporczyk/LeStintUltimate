import { type Stint, type Schedule } from '@stint-ultimate/shared'

const API_URL = import.meta.env.VITE_API_URL

interface ScheduleResponse {
  schedule: Schedule | null
  stints: Stint[]
}

export const ScheduleApi = {
  getByRaceId: async (raceId: string): Promise<ScheduleResponse> => {
    const res = await fetch(`${API_URL}/schedule/${raceId}`)
    return res.json()
  },
}
