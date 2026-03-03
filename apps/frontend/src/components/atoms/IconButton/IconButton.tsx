import type { ButtonHTMLAttributes } from 'react'
import { IconButton as StyledIconButton } from './IconButton.styles.ts'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
}

export function IconButton({ icon, ...props }: IconButtonProps) {
  return (
    <StyledIconButton {...props}>
      <img src={icon} alt="" />
    </StyledIconButton>
  )
}
