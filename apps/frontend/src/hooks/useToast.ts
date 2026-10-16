import { createContext, useContext } from 'react'

export interface ToastContextType {
  // Shows a short error message at the bottom of the screen.
  showError: (message: string) => void
}

export const ToastContext = createContext<ToastContextType>({ showError: () => {} })

export function useToast() {
  return useContext(ToastContext)
}
