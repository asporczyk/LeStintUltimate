import type { ButtonHTMLAttributes } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import { IconButton as StyledIconButton } from './IconButton.styles'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
  size?: 'sm' | 'md'
}

// Icon-only button; `title` doubles as its accessible name.
export function IconButton({ icon, size = 'md', title, ...props }: IconButtonProps) {
  return (
    <StyledIconButton type="button" title={title} aria-label={title} $size={size} {...props}>
      <Icon src={icon} size={size === 'sm' ? '1rem' : '1.125rem'} />
    </StyledIconButton>
  )
}
