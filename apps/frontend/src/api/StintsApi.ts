import { type Stint } from 'types/Schedule'

const API_URL = `${import.meta.env.VITE_API_URL}/stints`

export const StintsApi = {
  create: async (stint: Omit<Stint, '_id'>): Promise<Stint> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stint),
    })
    return res.json()
  },

  update: async (id: string, data: Partial<Stint>): Promise<Stint> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
  },
}
