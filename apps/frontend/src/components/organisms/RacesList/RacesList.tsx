import { RaceItem } from '../../molecules/RaceItem/RaceItem.tsx'
import { RacesListContainer } from './RacesList.styles.ts'
import { type Race } from '../../../types/Race.ts'

interface RacesListProps {
  races: Race[]
  onDelete: (id: string) => void
  onOpen: (id: string) => void
}

export function RacesList({ races, onDelete, onOpen }: RacesListProps) {

  return (
    <RacesListContainer>
      {[...races].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((race) => (
        <RaceItem race={race} onDelete={onDelete} onOpen={onOpen}/>
      ))}
    </RacesListContainer>
  )
}
