import type { ButtonHTMLAttributes } from 'react'

interface DeleteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
}

export function DeleteButton({ onClick, ...props }: DeleteButtonProps) {
  return (
    <button onClick={onClick} className="delete-button" title="Usuń" {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    </button>
  )
}
