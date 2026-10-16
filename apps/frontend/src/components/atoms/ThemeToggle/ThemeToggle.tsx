import type { ReactElement } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useThemeMode, type ThemeMode } from '@/hooks/useThemeMode'

const Group = styled.div`
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
`

const Option = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2rem;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.onPrimary : theme.colors.textSecondary};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    color: ${({ $active, theme }) => $active ? theme.colors.onPrimary : theme.colors.text};
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const icons: Record<ThemeMode, ReactElement> = {
  system: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  light: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  ),
}

const MODES: ThemeMode[] = ['system', 'light', 'dark']

// Device setting by default; light or dark when the user picks one.
export function ThemeToggle() {
  const { t } = useTranslation('common')
  const { mode, setMode } = useThemeMode()

  return (
    <Group role="radiogroup" aria-label={t('theme')}>
      {MODES.map(option => (
        <Option
          key={option}
          type="button"
          role="radio"
          aria-checked={mode === option}
          aria-label={t(`theme-${option}`)}
          title={t(`theme-${option}`)}
          $active={mode === option}
          onClick={() => setMode(option)}
        >
          {icons[option]}
        </Option>
      ))}
    </Group>
  )
}
