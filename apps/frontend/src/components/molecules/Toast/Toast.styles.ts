import styled from 'styled-components'

export const ToastContainer = styled.div`
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: calc(100vw - 32px);
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgDarkMid};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
`

export const ToastClose = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
`
