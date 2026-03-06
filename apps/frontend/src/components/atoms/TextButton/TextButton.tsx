import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { TextButton as StyledTextButton } from './TextButton.styles'

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  $variant?: 'primary' | 'secondary' | 'danger'
}

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ children, $variant = 'primary', ...props }, ref) => {
    return (
      <StyledTextButton ref={ref} $variant={$variant} {...props}>
        {children}
      </StyledTextButton>
    )
  }
)

TextButton.displayName = 'TextButton'
