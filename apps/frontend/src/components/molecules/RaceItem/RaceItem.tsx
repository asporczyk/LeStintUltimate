import { useTranslation } from 'react-i18next'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import {RaceActions, RaceDate, RaceInfo, RaceItemContainer, RaceName} from './RaceItem.styles'
import { type Race } from 'types/Race'
import TrashIcon from 'assets/svg/trash.svg'

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
        <RaceDate>{new Date(race.createdAt).toLocaleDateString('pl-PL')}</RaceDate>
      </RaceInfo>
      <RaceActions>
        <TextButton onClick={() => onOpen(race._id)} $variant="secondary">{t('open-race')}</TextButton>
        <IconButton onClick={() => onDelete(race._id)} title={tCommon('delete')} icon={TrashIcon} />
      </RaceActions>
    </RaceItemContainer>
  )
}
