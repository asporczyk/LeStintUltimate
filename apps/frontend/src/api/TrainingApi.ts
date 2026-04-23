const API_URL = `${import.meta.env.VITE_API_URL}/training`;

export interface Training {
  _id?: string;
  raceId?: string;
  startTime: string;
  duration: number;
}

export const TrainingApi = {
  getByRaceId: async (raceId: string): Promise<Training> => {
    const res = await fetch(`${API_URL}/${raceId}`)
    if (!res.ok) {
      throw new Error('Training not found')
    }
    return res.json()
  },

  create: async (raceId: string, data: Partial<Training>): Promise<Training> => {
    const res = await fetch(`${API_URL}/${raceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (raceId: string, data: Partial<Training>): Promise<Training> => {
    const res = await fetch(`${API_URL}/${raceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  delete: async (raceId: string): Promise<void> => {
    await fetch(`${API_URL}/${raceId}`, { method: 'DELETE' })
  }
}