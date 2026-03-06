import { useState, useCallback, useEffect } from 'react'
import { RaceInputGroup } from 'components/molecules/RaceInputGroup/RaceInputGroup'
import { RacesList } from 'components/molecules/RacesList/RacesList'
import { Loader } from 'components/atoms/Loader/Loader'
import { type Race } from 'types/Race'
import { DashboardContainer, LimitBadge } from './RacesDashboard.styles'

interface RacesDashboardProps {
  initialRaces?: Race[]
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function RacesDashboard({ initialRaces }: RacesDashboardProps) {
  const [races, setRaces] = useState<Race[]>(initialRaces ?? [])
  const [raceCount, setRaceCount] = useState(0)
  const [raceLimit] = useState(100)
  const [loading, setLoading] = useState(true)

  const fetchRaces = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`${API_URL}/races`)
    const data = await res.json()
    setRaces(data.races)
    setRaceCount(data.count)
    setLoading(false)
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
    <DashboardContainer>
      <RaceInputGroup onAdd={handleAdd} />
      {loading ? <Loader /> : <RacesList races={races} onDelete={handleDelete} onOpen={handleOpen} />}
      <LimitBadge>{raceCount}/{raceLimit}</LimitBadge>
    </DashboardContainer>
  )
}
