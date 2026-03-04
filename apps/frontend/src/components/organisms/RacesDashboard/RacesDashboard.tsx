import { useState, useCallback } from 'react'
import { RaceInputGroup } from 'components/molecules/RaceInputGroup/RaceInputGroup'
import { RacesList } from 'components/molecules/RacesList/RacesList'
import { type Race } from 'types/Race'

interface RacesDashboardProps {
  initialRaces?: Race[]
}

export function RacesDashboard({ initialRaces }: RacesDashboardProps) {
  const defaultRaces: Race[] = [
    { id: '1', name: '24h Le Mans 2025', createdAt: new Date('2025-01-15') },
    { id: '2', name: 'Sebring 12h', createdAt: new Date('2025-02-20') },
    { id: '3', name: 'Monza 6h', createdAt: new Date('2025-03-01') },
  ]

  const [races, setRaces] = useState<Race[]>(initialRaces ?? defaultRaces)

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
