import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
}

export function IconButton({ icon, className = '', ...props }: IconButtonProps) {
  return (
    <button className={`icon-button ${className}`} {...props}>
      {icon}
    </button>
  )
}
