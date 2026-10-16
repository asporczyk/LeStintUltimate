import { useTranslation } from 'react-i18next'
import { RaceItem } from 'components/molecules/RaceItem/RaceItem'
import { RacesListContainer, EmptyList } from './RacesList.styles'
import { type Race } from 'types/Race'

interface RacesListProps {
  races: Race[]
  onDelete: (id: string) => void
  onOpen: (id: string) => void
}

export function RacesList({ races, onDelete, onOpen }: RacesListProps) {
  const { t } = useTranslation('home')
  const sortedRaces = [...races].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <RacesListContainer>
      {sortedRaces.length === 0 ? (
        <EmptyList>{t('no-races')}</EmptyList>
      ) : (
        sortedRaces.map((race) => (
          <RaceItem key={race._id} race={race} onDelete={onDelete} onOpen={onOpen} />
        ))
      )}
    </RacesListContainer>
  )
}
