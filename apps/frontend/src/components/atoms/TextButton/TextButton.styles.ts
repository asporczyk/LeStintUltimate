import styled, { css } from 'styled-components'

type Variant = 'primary' | 'secondary' | 'danger'

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.onPrimary};
    border-color: ${({ theme }) => theme.colors.primary};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primaryHover};
      border-color: ${({ theme }) => theme.colors.primaryHover};
    }
  `,
  secondary: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.colors.primary};
      border-color: ${({ theme }) => theme.colors.primary};
      background: ${({ theme }) => theme.colors.primarySoft};
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.colors.danger};
    color: #fff;
    border-color: ${({ theme }) => theme.colors.danger};

    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  `,
}

export const TextButton = styled.button<{ $variant?: Variant; $size?: 'sm' | 'md' }>`
  font-family: ${({ theme }) => theme.fonts.hanken};
  font-weight: 700;
  font-size: ${({ $size }) => $size === 'sm' ? '0.75rem' : '0.875rem'};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: ${({ $size }) => $size === 'sm' ? '0.5rem 0.875rem' : '0.75rem 1.5rem'};
  min-height: ${({ $size }) => $size === 'sm' ? '2.125rem' : '2.75rem'};
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius.sm};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;

  ${({ $variant = 'primary' }) => variants[$variant]}

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`
