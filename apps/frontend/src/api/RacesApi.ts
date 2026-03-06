import { type Race } from 'types/Race'

const API_URL = `${import.meta.env.VITE_API_URL}/races`

interface RacesResponse {
  races: Race[]
  count: number
  limit: number
}

export const RacesApi = {
  getAll: async (): Promise<RacesResponse> => {
    const res = await fetch(API_URL)
    return res.json()
  },

  create: async (name: string): Promise<Race> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, startDate: new Date().toISOString() }),
    })
    return res.json()
  },

  delete: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
  },

  getById: async (id: string): Promise<Race> => {
    const res = await fetch(`${API_URL}/${id}`)
    if (!res.ok) {
      throw new Error('Race not found')
    }
    return res.json()
  },
}
