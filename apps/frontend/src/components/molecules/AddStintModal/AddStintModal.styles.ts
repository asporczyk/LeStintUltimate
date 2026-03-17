import styled from 'styled-components'

export const Overlay = styled.div`
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

export const ModalContent = styled.div`
  background: linear-gradient(180deg, #000833 0%, #001244 100%);
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

export const ModalTitle = styled.h2`
  margin: 0 0 16px;
  font-size: 18px;
  color: #fff;
  font-family: 'Hanken Grotesk', sans-serif;
`

export const ModalText = styled.p`
  margin: 0 0 24px;
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Hanken Grotesk', sans-serif;
`

export const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`
