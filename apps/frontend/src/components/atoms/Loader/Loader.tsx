import styled, { keyframes } from 'styled-components'
import { useTranslation } from 'react-i18next'

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const LoaderWrapper = styled.div<{ $fullPage: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 2rem;
  min-height: ${({ $fullPage }) => $fullPage ? '100vh' : 'auto'};
`

const Spinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`

interface LoaderProps {
  // Centers the spinner in the whole viewport instead of its container.
  fullPage?: boolean
}

export function Loader({ fullPage = false }: LoaderProps) {
  const { t } = useTranslation('common')
  return (
    <LoaderWrapper $fullPage={fullPage} role="status" aria-label={t('loading')}>
      <Spinner />
    </LoaderWrapper>
  )
}
