import { type Race } from 'types/Race'
import { request, jsonBody } from 'api/request'

const API_URL = `${import.meta.env.VITE_API_URL}/races`

interface RacesResponse {
  races: Race[]
  count: number
  limit: number
}

export const RacesApi = {
  getAll: (): Promise<RacesResponse> => request(API_URL),

  create: (name: string): Promise<Race> =>
    request(API_URL, jsonBody('POST', { name, startDate: new Date().toISOString() })),

  delete: async (id: string): Promise<void> => {
    await request(`${API_URL}/${id}`, { method: 'DELETE' })
  },

  getById: (id: string): Promise<Race> => request(`${API_URL}/${id}`),

  update: (id: string, data: Partial<Race>): Promise<Race> =>
    request(`${API_URL}/${id}`, jsonBody('PATCH', data)),
}
