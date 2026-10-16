import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { RaceInputGroup } from 'components/molecules/RaceInputGroup/RaceInputGroup'
import { RacesList } from 'components/molecules/RacesList/RacesList'
import { Loader } from 'components/atoms/Loader/Loader'
import { RacesApi } from 'api/RacesApi'
import { type Race } from 'types/Race'
import { DashboardContainer, ErrorMessage, LimitBadge } from './RacesDashboard.styles'

interface RacesDashboardProps {
  initialRaces?: Race[]
}

export function RacesDashboard({ initialRaces }: RacesDashboardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('home')
  const [races, setRaces] = useState<Race[]>(initialRaces ?? [])
  const [raceCount, setRaceCount] = useState(0)
  const [raceLimit, setRaceLimit] = useState(100)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRaces = useCallback(async () => {
    setLoading(true)
    try {
      const data = await RacesApi.getAll()
      setRaces(data.races)
      setRaceCount(data.count)
      setRaceLimit(data.limit)
    } catch (err) {
      console.error('Failed to load races', err)
      setError(t('request-failed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchRaces()
  }, [fetchRaces])

  const handleAdd = useCallback(async (raceName: string) => {
    if (!raceName.trim()) return
    if (raceCount >= raceLimit) {
      setError(t('race-limit-reached', { limit: raceLimit }))
      return
    }
    try {
      setError(null)
      await RacesApi.create(raceName)
    } catch (err) {
      console.error('Failed to create race', err)
      setError(t('request-failed'))
    }
    await fetchRaces()
  }, [fetchRaces, raceCount, raceLimit, t])

  const handleDelete = useCallback(async (id: string) => {
    try {
      setError(null)
      await RacesApi.delete(id)
    } catch (err) {
      console.error('Failed to delete race', err)
      setError(t('request-failed'))
    }
    await fetchRaces()
  }, [fetchRaces, t])

  const handleOpen = useCallback((id: string) => {
    navigate(`/race/${id}`)
  }, [navigate])

  return (
    <DashboardContainer>
      <RaceInputGroup onAdd={handleAdd} />
      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
      {loading ? <Loader /> : <RacesList races={races} onDelete={handleDelete} onOpen={handleOpen} />}
      <LimitBadge>{raceCount}/{raceLimit}</LimitBadge>
    </DashboardContainer>
  )
}
