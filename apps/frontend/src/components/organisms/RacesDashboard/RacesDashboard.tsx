import { useState, useCallback } from 'react'
import { RaceInputGroup } from 'components/molecules/RaceInputGroup/RaceInputGroup'
import { RacesList } from 'components/molecules/RacesList/RacesList'
import { type Race } from 'types/Race'

interface RacesDashboardProps {
  initialRaces?: Race[]
}

export function RacesDashboard({ initialRaces = [] }: RacesDashboardProps) {
  const [races, setRaces] = useState<Race[]>(initialRaces)

  const handleAdd = useCallback((raceName: string) => {
    if (raceName.trim()) {
      const newRace: Race = {
        id: Date.now().toString(),
        name: raceName,
        createdAt: new Date(),
      }
      setRaces((prevRaces) => [...prevRaces, newRace])
    }
  }, [])

  const handleDelete = useCallback((id: string) => {
    setRaces((prevRaces) => prevRaces.filter((race) => race.id !== id))
  }, [])

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
