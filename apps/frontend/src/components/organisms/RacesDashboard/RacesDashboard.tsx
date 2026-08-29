import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RaceInputGroup } from 'components/molecules/RaceInputGroup/RaceInputGroup'
import { RacesList } from 'components/molecules/RacesList/RacesList'
import { Loader } from 'components/atoms/Loader/Loader'
import { useRaces } from 'hooks/useRaces'
import { DashboardContainer, LimitBadge } from './RacesDashboard.styles'

export function RacesDashboard() {
  const navigate = useNavigate()
  const { races, count, limit, isLoading, createRace, deleteRace } = useRaces()

  const handleAdd = useCallback(async (raceName: string) => {
    if (raceName.trim()) {
      createRace(raceName)
    }
  }, [createRace])

  const handleDelete = useCallback(async (id: string) => {
    deleteRace(id)
  }, [deleteRace])

  const handleOpen = useCallback((id: string) => {
    navigate(`/race/${id}`)
  }, [navigate])

  return (
    <DashboardContainer>
      <RaceInputGroup onAdd={handleAdd} />
      {isLoading ? <Loader /> : <RacesList races={races} onDelete={handleDelete} onOpen={handleOpen} />}
      <LimitBadge>{count}/{limit}</LimitBadge>
    </DashboardContainer>
  )
}
