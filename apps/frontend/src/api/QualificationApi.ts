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
  getByRaceId: async (raceId: string): Promise<Qualification> => {
    const res = await fetch(`${API_URL}/${raceId}`)
    if (!res.ok) {
      throw new Error('Qualification not found')
    }
    return res.json()
  },

  create: async (raceId: string, data: Partial<Qualification>): Promise<Qualification> => {
    const res = await fetch(`${API_URL}/${raceId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  update: async (raceId: string, data: Partial<Qualification>): Promise<Qualification> => {
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
