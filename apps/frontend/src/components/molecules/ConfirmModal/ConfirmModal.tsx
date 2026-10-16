import { useEffect, useRef } from 'react'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useTranslation } from 'react-i18next'
import { Overlay, ModalContent, ModalTitle, ModalText, ModalButtons } from 'components/molecules/Modal/Modal.styles'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  const { t } = useTranslation('raceDetails')
  const cancelRef = useRef<HTMLButtonElement>(null)

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
      <ModalContent $width="400px" aria-labelledby="confirm-modal-title" onClick={(e) => e.stopPropagation()}>
        <ModalTitle id="confirm-modal-title">{title}</ModalTitle>
        <ModalText>{message}</ModalText>
        <ModalButtons>
          <TextButton $variant="secondary" ref={cancelRef} onClick={onCancel}>
            {t('cancel')}
          </TextButton>
          <TextButton $variant="danger" onClick={onConfirm}>
            {t('delete')}
          </TextButton>
        </ModalButtons>
      </ModalContent>
    </Overlay>
  )
}