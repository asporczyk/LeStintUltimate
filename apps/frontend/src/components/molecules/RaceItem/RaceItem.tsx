import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import {ConfirmModal} from 'components/molecules/ConfirmModal/ConfirmModal'
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
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = () => {
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onDelete(race._id)
    setShowConfirm(false)
  }

  return (
    <>
      <RaceItemContainer>
        <RaceInfo>
          <RaceName>{race.name}</RaceName>
          <RaceDate>{new Date(race.createdAt).toLocaleDateString('pl-PL')}</RaceDate>
        </RaceInfo>
        <RaceActions>
          <TextButton onClick={() => onOpen(race._id)} $variant="secondary">{t('open-race')}</TextButton>
          <IconButton onClick={handleDelete} title={tCommon('delete')} icon={TrashIcon} />
        </RaceActions>
      </RaceItemContainer>
      <ConfirmModal
        isOpen={showConfirm}
        title={tCommon('delete-confirm-title') || 'Usuń wyścig'}
        message={tCommon('confirm-delete') || 'Czy na pewno chcesz usunąć ten wyścig?'}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
