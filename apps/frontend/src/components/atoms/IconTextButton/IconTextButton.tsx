import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import { IconTextButton as StyledIconTextButton } from './IconTextButton.styles'

interface IconTextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
  children: ReactNode
}

// On narrow screens only the icon is shown; the text stays as the accessible name.
export function IconTextButton({ icon, children, ...props }: IconTextButtonProps) {
  return (
    <StyledIconTextButton type="button" {...props}>
      <Icon src={icon} />
      <span className="label">{children}</span>
    </StyledIconTextButton>
  )
}
