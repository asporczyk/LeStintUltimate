import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { IconTextButton as StyledIconTextButton } from './IconTextButton.styles'

interface IconTextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
  children: ReactNode
}

export function IconTextButton({ icon, children, ...props }: IconTextButtonProps) {
  return (
    <StyledIconTextButton {...props}>
      <img src={icon} alt="" />
      {children}
    </StyledIconTextButton>
  )
}
