import { useState, useCallback, useEffect } from 'react'
import { RaceInputGroup } from 'components/molecules/RaceInputGroup/RaceInputGroup'
import { RacesList } from 'components/molecules/RacesList/RacesList'
import { Loader } from 'components/atoms/Loader/Loader'
import { RacesApi } from 'api/RacesApi'
import { type Race } from 'types/Race'
import { DashboardContainer, LimitBadge } from './RacesDashboard.styles'

interface RacesDashboardProps {
  initialRaces?: Race[]
}

export function RacesDashboard({ initialRaces }: RacesDashboardProps) {
  const [races, setRaces] = useState<Race[]>(initialRaces ?? [])
  const [raceCount, setRaceCount] = useState(0)
  const [raceLimit] = useState(100)
  const [loading, setLoading] = useState(true)

  const fetchRaces = useCallback(async () => {
    setLoading(true)
    const data = await RacesApi.getAll()
    setRaces(data.races)
    setRaceCount(data.count)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRaces()
  }, [fetchRaces])

  const handleAdd = useCallback(async (raceName: string) => {
    if (raceName.trim()) {
      await RacesApi.create(raceName)
      await fetchRaces()
    }
  }, [fetchRaces])

  const handleDelete = useCallback(async (id: string) => {
    await RacesApi.delete(id)
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
