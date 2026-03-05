import { useState, useCallback, useEffect } from 'react'
import { RaceInputGroup } from 'components/molecules/RaceInputGroup/RaceInputGroup'
import { RacesList } from 'components/molecules/RacesList/RacesList'
import { type Race } from 'types/Race'

interface RacesDashboardProps {
  initialRaces?: Race[]
}

const API_URL = 'http://localhost:3000/api'

export function RacesDashboard({ initialRaces }: RacesDashboardProps) {
  const [races, setRaces] = useState<Race[]>(initialRaces ?? [])

  const fetchRaces = useCallback(async () => {
    const res = await fetch(`${API_URL}/races`)
    const data = await res.json()
    setRaces(data)
  }, [])

  useEffect(() => {
    fetchRaces()
  }, [fetchRaces])

  const handleAdd = useCallback(async (raceName: string) => {
    if (raceName.trim()) {
      await fetch(`${API_URL}/races`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: raceName, startDate: new Date().toISOString() }),
      })
      await fetchRaces()
    }
  }, [fetchRaces])

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`${API_URL}/races/${id}`, { method: 'DELETE' })
    await fetchRaces()
  }, [fetchRaces])

  const handleOpen = useCallback((id: string) => {
    console.log('Open race:', id)
  }, [])

  return (
    <>
      <RaceInputGroup onAdd={handleAdd} />
      <RacesList races={races} onDelete={handleDelete} onOpen={handleOpen} />
    </>
  )
}
