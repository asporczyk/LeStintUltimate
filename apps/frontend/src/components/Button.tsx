import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon'
  children: ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const variantClass = variant === 'icon' ? '' : variant === 'secondary' ? 'open-button' : 'start-button add-button'
  
  return (
    <button className={`${variantClass} ${className}`} {...props}>
      {children}
    </button>
  )
}
