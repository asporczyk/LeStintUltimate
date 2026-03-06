import { type Race } from 'types/Race'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface RacesResponse {
  races: Race[]
  count: number
  limit: number
}

export const RacesApi = {
  getAll: async (): Promise<RacesResponse> => {
    const res = await fetch(`${API_URL}/races`)
    return res.json()
  },

  create: async (name: string): Promise<Race> => {
    const res = await fetch(`${API_URL}/races`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, startDate: new Date().toISOString() }),
    })
    return res.json()
  },

  delete: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/races/${id}`, { method: 'DELETE' })
  },
}
