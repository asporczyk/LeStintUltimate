import { RaceItem } from 'components/molecules/RaceItem/RaceItem'
import { RacesListContainer } from './RacesList.styles'
import { type Race } from 'types/Race'

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
