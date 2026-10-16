import styled from 'styled-components'

export const IconTextButton = styled.button`
  font-family: ${({ theme }) => theme.fonts.hanken};
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.04em;
  padding: 0.625rem 1rem;
  min-height: 2.75rem;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 600px) {
    padding: 0.625rem 0.75rem;

    .label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }
`
