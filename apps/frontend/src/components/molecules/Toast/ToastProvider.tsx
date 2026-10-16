import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastContext } from '@/hooks/useToast'
import { ToastClose, ToastContainer } from './Toast.styles'

const TOAST_DURATION_MS = 5000

export function ToastProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common')
  const [message, setMessage] = useState<string | null>(null)

  const showError = useCallback((text: string) => setMessage(text), [])

  useEffect(() => {
    if (!message) return
    const timeout = setTimeout(() => setMessage(null), TOAST_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [message])

  const value = useMemo(() => ({ showError }), [showError])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <ToastContainer role="alert">
          {message}
          <ToastClose type="button" aria-label={t('close')} onClick={() => setMessage(null)}>×</ToastClose>
        </ToastContainer>
      )}
    </ToastContext.Provider>
  )
}
