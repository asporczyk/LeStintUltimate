import type { ButtonHTMLAttributes } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
}

export function IconButton({ icon, className = '', ...props }: IconButtonProps) {
  return (
    <button className={`icon-button ${className}`} {...props}>
      <img src={icon} alt="" />
    </button>
  )
}
