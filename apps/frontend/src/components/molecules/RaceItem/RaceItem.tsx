import { useTranslation } from 'react-i18next'
import { TextButton } from '../../atoms/TextButton/TextButton.tsx'
import { IconButton } from '../../atoms/IconButton/IconButton.tsx'
import {RaceActions, RaceDate, RaceInfo, RaceItemContainer, RaceName} from './RaceItem.styles.ts'
import { type Race } from '../../../types/Race.ts'
import TrashIcon from '../../../assets/svg/trash.svg'

interface RaceItemProps {
  race: Race
  onDelete: (id: string) => void
  onOpen: (id: string) => void
}

export function RaceItem({ race, onDelete, onOpen }: RaceItemProps) {
  const { t } = useTranslation('home')
  const { t: tCommon } = useTranslation('common')

  return (
    <RaceItemContainer>
      <RaceInfo>
        <RaceName>{race.name}</RaceName>
        <RaceDate>{race.createdAt.toLocaleDateString('pl-PL')}</RaceDate>
      </RaceInfo>
      <RaceActions>
        <TextButton onClick={() => onOpen(race.id)} $variant="secondary">{t('openRace')}</TextButton>
        <IconButton onClick={() => onDelete(race.id)} title={tCommon('delete')} icon={TrashIcon} />
      </RaceActions>
    </RaceItemContainer>
  )
}
