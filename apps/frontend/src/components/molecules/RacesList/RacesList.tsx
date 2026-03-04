import { useTranslation } from 'react-i18next'
import { RaceItem } from 'components/molecules/RaceItem/RaceItem'
import { RacesListContainer } from './RacesList.styles'
import { type Race } from 'types/Race'
import { Caption } from 'components/atoms/Typography/Typography.styles'

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
        <Caption>{t('no-races')}</Caption>
      ) : (
        sortedRaces.map((race) => (
          <RaceItem key={race._id} race={race} onDelete={onDelete} onOpen={onOpen} />
        ))
      )}
    </RacesListContainer>
  )
}
