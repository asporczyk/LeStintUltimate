import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles, theme } from 'styles/theme'
import { SocketProvider } from '@/hooks/SocketProvider'
import { ThemeModeProvider } from '@/hooks/ThemeModeProvider'
import { ToastProvider } from 'components/molecules/Toast/ToastProvider'
import 'i18n/i18n'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <ThemeModeProvider>
        <BrowserRouter>
          <SocketProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </SocketProvider>
        </BrowserRouter>
      </ThemeModeProvider>
    </ThemeProvider>
  </StrictMode>,
)
