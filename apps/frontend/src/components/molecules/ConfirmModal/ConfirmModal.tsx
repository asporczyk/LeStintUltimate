import { useEffect, useRef } from 'react'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: linear-gradient(180deg, #000833 0%, #001244 100%);
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const ModalTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 18px;
  color: #fff;
  font-family: 'Hanken Grotesk', sans-serif;
`

const ModalText = styled.p`
  margin: 0 0 24px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Hanken Grotesk', sans-serif;
`

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`

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
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{title}</ModalTitle>
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