import styled from 'styled-components'
import { fieldStyles } from 'styles/theme'

export const TextInput = styled.input<{ $invalid?: boolean }>`
  ${fieldStyles}
  padding: 0.75rem 1rem;
  min-height: 2.75rem;

  ${({ $invalid, theme }) => $invalid && `
    &,
    &:hover:not(:disabled),
    &:focus {
      border-color: ${theme.colors.danger};
    }
  `}
`
