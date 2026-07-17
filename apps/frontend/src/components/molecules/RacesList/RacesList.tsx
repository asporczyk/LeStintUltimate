import { useTranslation } from 'react-i18next'
import { RaceItem } from 'components/molecules/RaceItem/RaceItem'
import { RacesListContainer } from './RacesList.styles'
import { type Race } from '@stint-ultimate/shared'
import { Caption } from 'components/atoms/Typography/Typography.styles'

interface RacesListProps {
  races: Race[]
  onDelete: (id: string) => void
  onOpen: (id: string) => void
}

export function RacesList({ races, onDelete, onOpen }: RacesListProps) {
  const { t } = useTranslation('home')

  if (races.length === 0) {
    return (
      <RacesListContainer>
        <Caption style={{ textAlign: 'center', opacity: 0.6 }}>{t('noRaces')}</Caption>
      </RacesListContainer>
    )
  }

  return (
    <RacesListContainer>
      {races.map((race) => (
        <RaceItem key={race._id} race={race} onDelete={onDelete} onOpen={onOpen} />
      ))}
    </RacesListContainer>
  )
}
