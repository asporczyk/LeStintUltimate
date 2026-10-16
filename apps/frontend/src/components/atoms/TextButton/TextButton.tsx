import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { TextButton as StyledTextButton } from './TextButton.styles'

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  $variant?: 'primary' | 'secondary' | 'danger'
  $size?: 'sm' | 'md'
}

export const TextButton = forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ children, $variant = 'primary', $size = 'md', ...props }, ref) => {
    return (
      <StyledTextButton ref={ref} $variant={$variant} $size={$size} {...props}>
        {children}
      </StyledTextButton>
    )
  }
)

TextButton.displayName = 'TextButton'
