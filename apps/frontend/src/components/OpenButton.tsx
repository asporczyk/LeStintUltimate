import type { ButtonHTMLAttributes } from 'react'

interface OpenButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
}

export function OpenButton({ onClick, ...props }: OpenButtonProps) {
  return (
    <button onClick={onClick} className="open-button" {...props}>
      Otwórz
    </button>
  )
}
