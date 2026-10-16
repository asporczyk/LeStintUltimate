import { createContext, useContext } from 'react'
import { type ColorScheme } from 'styles/theme'

// "system" follows the device setting; the others are the user's override.
export type ThemeMode = 'system' | ColorScheme

export const THEME_STORAGE_KEY = 'theme'

export interface ThemeModeContextType {
  mode: ThemeMode
  scheme: ColorScheme
  setMode: (mode: ThemeMode) => void
}

export const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: 'system',
  scheme: 'dark',
  setMode: () => {},
})

export function useThemeMode() {
  return useContext(ThemeModeContext)
}
