import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { GlobalStyles, theme } from 'styles/theme'
import { SocketProvider } from '@/hooks/useSocket'
import 'i18n/i18n'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <BrowserRouter>
        <SocketProvider>
          <App />
        </SocketProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
