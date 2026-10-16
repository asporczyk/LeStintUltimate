import { request, jsonBody } from 'api/request'

const API_URL = `${import.meta.env.VITE_API_URL}/qualification`;

export interface Qualification {
  _id?: string;
  raceId?: string;
  startTime: string;
  duration: number;
  laps: number;
  driver: string;
  spotter: string;
  fuel: number;
  tireFL: string;
  tireFR: string;
  tireRL: string;
  tireRR: string;
}

export const QualificationApi = {
  // null when the race has no qualification yet (204)
  getByRaceId: (raceId: string): Promise<Qualification | null> => request(`${API_URL}/${raceId}`),

  create: (raceId: string, data: Partial<Qualification>): Promise<Qualification> =>
    request(`${API_URL}/${raceId}`, jsonBody('POST', data)),

  update: (raceId: string, data: Partial<Qualification>): Promise<Qualification> =>
    request(`${API_URL}/${raceId}`, jsonBody('PATCH', data)),

  delete: async (raceId: string): Promise<void> => {
    await request(`${API_URL}/${raceId}`, { method: 'DELETE' })
  },
}
