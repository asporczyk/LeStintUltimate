import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { TextButton as StyledTextButton } from './TextButton.styles.ts'

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  $variant?: 'primary' | 'secondary'
}

export function TextButton({ children, $variant = 'primary', ...props }: TextButtonProps) {
  return (
    <StyledTextButton $variant={$variant} {...props}>
      {children}
    </StyledTextButton>
  )
}
