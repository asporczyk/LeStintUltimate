import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { type ColorScheme } from 'styles/theme'
import { ThemeModeContext, THEME_STORAGE_KEY, type ThemeMode } from './useThemeMode'

const LIGHT_QUERY = '(prefers-color-scheme: light)'

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Storage can be blocked (private mode); fall back to the device setting.
  }
  return 'system'
}

const systemScheme = (): ColorScheme => (window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark')

// Keeps <html data-theme> in sync with the chosen mode and the device setting.
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)
  const [deviceScheme, setDeviceScheme] = useState<ColorScheme>(systemScheme)

  useEffect(() => {
    const query = window.matchMedia(LIGHT_QUERY)
    const onChange = () => setDeviceScheme(query.matches ? 'light' : 'dark')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const scheme = mode === 'system' ? deviceScheme : mode

  useEffect(() => {
    document.documentElement.dataset.theme = scheme
  }, [scheme])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    try {
      if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
      else localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Not remembered across visits, but still applied now.
    }
  }, [])

  const value = useMemo(() => ({ mode, scheme, setMode }), [mode, scheme, setMode])

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
}
