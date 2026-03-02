import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function TextButton({ children, className = '', ...props }: TextButtonProps) {
  return (
    <button className={`text-button ${className}`} {...props}>
      {children}
    </button>
  )
}
