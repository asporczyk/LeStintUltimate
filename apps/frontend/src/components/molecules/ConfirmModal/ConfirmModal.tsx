import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { TextButton } from 'components/atoms/TextButton/TextButton'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  text-align: center;
`

const ModalTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 18px;
`

const ModalText = styled.p`
  margin: 0 0 24px;
  color: #666;
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
          <TextButton $variant="secondary" ref={cancelRef} onClick={onCancel}>Anuluj</TextButton>
          <TextButton $variant="danger" onClick={onConfirm}>Usuń</TextButton>
        </ModalButtons>
      </ModalContent>
    </Overlay>
  )
}
