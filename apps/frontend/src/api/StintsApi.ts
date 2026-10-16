import { type NewStint, type Stint } from 'types/Schedule'
import { request, jsonBody } from 'api/request'

const API_URL = `${import.meta.env.VITE_API_URL}/stints`

export const StintsApi = {
  create: (stint: NewStint): Promise<Stint> => request(API_URL, jsonBody('POST', stint)),

  update: (id: string, data: Partial<Stint>): Promise<Stint> =>
    request(`${API_URL}/${id}`, jsonBody('PUT', data)),

  delete: async (id: string): Promise<void> => {
    await request(`${API_URL}/${id}`, { method: 'DELETE' })
  },
}
