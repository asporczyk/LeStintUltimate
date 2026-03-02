import type { ButtonHTMLAttributes } from 'react'

interface AddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
}

export function AddButton({ onClick, ...props }: AddButtonProps) {
  return (
    <button onClick={onClick} className="start-button add-button" {...props}>
      <span className="add-text">Dodaj</span>
      <svg className="add-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  )
}
