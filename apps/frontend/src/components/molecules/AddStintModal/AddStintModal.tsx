import { useEffect, useRef } from 'react'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useTranslation } from 'react-i18next'
import {
  Overlay,
  ModalContent,
  ModalTitle,
  ModalText,
  ModalButtons
} from './AddStintModal.styles'

interface AddStintModalProps {
  isOpen: boolean
  insertAfterStint: number
  totalStints: number
  onConfirm: () => void
  onCancel: () => void
}

export function AddStintModal({ isOpen, insertAfterStint, totalStints, onConfirm, onCancel }: AddStintModalProps) {
  const { t } = useTranslation('raceDetails')
  const cancelRef = useRef<HTMLButtonElement>(null)

  const isLastStint = insertAfterStint === totalStints
  const message = isLastStint 
    ? t('insertAfter', { after: insertAfterStint })
    : t('insertBetween', { after: insertAfterStint, before: insertAfterStint + 1 })

  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <Overlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{t('addStint')}</ModalTitle>
        <ModalText>
          {message}
        </ModalText>
        <ModalButtons>
          <TextButton $variant="secondary" ref={cancelRef} onClick={onCancel}>Anuluj</TextButton>
          <TextButton onClick={onConfirm}>Dodaj</TextButton>
        </ModalButtons>
      </ModalContent>
    </Overlay>
  )
}
