import { request, jsonBody } from 'api/request'

const API_URL = `${import.meta.env.VITE_API_URL}/training`;

export interface Training {
  _id?: string;
  raceId?: string;
  startTime: string;
  duration: number;
}

export const TrainingApi = {
  // null when the race has no training yet (204)
  getByRaceId: (raceId: string): Promise<Training | null> => request(`${API_URL}/${raceId}`),

  create: (raceId: string, data: Partial<Training>): Promise<Training> =>
    request(`${API_URL}/${raceId}`, jsonBody('POST', data)),

  update: (raceId: string, data: Partial<Training>): Promise<Training> =>
    request(`${API_URL}/${raceId}`, jsonBody('PATCH', data)),

  delete: async (raceId: string): Promise<void> => {
    await request(`${API_URL}/${raceId}`, { method: 'DELETE' })
  },
}
