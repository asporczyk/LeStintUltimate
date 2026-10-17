import { createGlobalStyle, css } from 'styled-components'

export type ColorScheme = 'light' | 'dark'

type Palette = Record<keyof Theme['colors'], string>

// Night race: deep navy and racing red, after Le Mans Ultimate.
const dark: Palette = {
  primary: '#FF1D44',
  primaryHover: '#FF4062',
  primarySoft: 'rgba(255, 29, 68, 0.14)',
  onPrimary: '#FFFFFF',
  bg: '#000833',
  bgGradient: 'linear-gradient(180deg, #000833 0%, #001244 55%, #000833 100%)',
  surface: '#071040',
  surfaceRaised: '#0E1A52',
  surfaceHover: 'rgba(255, 255, 255, 0.04)',
  inputBg: '#030A35',
  border: '#1F2C5E',
  borderStrong: '#34437A',
  text: '#F3F5FB',
  textSecondary: '#A5B0CC',
  textMuted: '#7884A8',
  success: '#3DD68C',
  successSoft: 'rgba(61, 214, 140, 0.13)',
  warning: '#FFB347',
  warningSoft: 'rgba(255, 179, 71, 0.12)',
  danger: '#FF4D5E',
  tireUsed: '#F7CF5C',
  tireWet: '#4DA3FF',
  overlay: 'rgba(0, 3, 20, 0.72)',
  shadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
}

// Day race: paper white with the same navy ink and a deeper red for contrast.
const light: Palette = {
  primary: '#D90F3A',
  primaryHover: '#B80C31',
  primarySoft: 'rgba(217, 15, 58, 0.08)',
  onPrimary: '#FFFFFF',
  bg: '#EEF1F7',
  bgGradient: 'linear-gradient(180deg, #F7F8FC 0%, #EBEEF6 100%)',
  surface: '#FFFFFF',
  surfaceRaised: '#F2F4FA',
  surfaceHover: 'rgba(11, 18, 56, 0.03)',
  inputBg: '#FFFFFF',
  border: '#DDE2EE',
  borderStrong: '#C2C9DB',
  text: '#0B1238',
  textSecondary: '#475275',
  textMuted: '#646F90',
  success: '#0F8A52',
  successSoft: 'rgba(15, 138, 82, 0.1)',
  warning: '#9A5800',
  warningSoft: 'rgba(230, 140, 20, 0.12)',
  danger: '#C8102E',
  tireUsed: '#E3AE12',
  tireWet: '#1F6FD1',
  overlay: 'rgba(11, 18, 56, 0.45)',
  shadow: '0 8px 24px rgba(11, 18, 56, 0.08)',
}

const cssVarName = (key: string) => `--${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`

const toCssVars = (palette: Palette) =>
  Object.entries(palette).map(([key, value]) => `${cssVarName(key)}: ${value};`).join('\n')

export interface Theme {
  colors: {
    primary: string
    primaryHover: string
    primarySoft: string
    onPrimary: string
    bg: string
    bgGradient: string
    surface: string
    surfaceRaised: string
    surfaceHover: string
    inputBg: string
    border: string
    borderStrong: string
    text: string
    textSecondary: string
    textMuted: string
    success: string
    successSoft: string
    warning: string
    warningSoft: string
    danger: string
    // Tire compounds on the schedule: new ones use success.
    tireUsed: string
    tireWet: string
    overlay: string
    shadow: string
  }
  fonts: {
    anton: string
    hanken: string
  }
  radius: {
    sm: string
    md: string
    lg: string
  }
}

// Components read CSS variables, so switching the scheme needs no re-render.
export const theme: Theme = {
  colors: Object.fromEntries(
    Object.keys(dark).map(key => [key, `var(${cssVarName(key)})`])
  ) as Palette,
  fonts: {
    anton: "'Anton', sans-serif",
    hanken: "'Hanken Grotesk', system-ui, sans-serif",
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
  },
}

// Driver colors on the race strip: light enough for dark navy text in both themes.
export const DRIVER_COLORS = ['#A99BFF', '#5FD4C4', '#FF9E7A', '#F7CF5C', '#7DB8F0', '#F08DBE']

// Phones and small tablets: full-width sections and card lists instead of wide tables.
export const MOBILE_QUERY = '(max-width: 720px)'

// Lets a block ignore the page's side padding on phones and reach the screen edges.
export const fullBleedOnMobile = css`
  @media ${MOBILE_QUERY} {
    width: auto;
    margin-inline: -1rem;
    border-left: none;
    border-right: none;
    border-radius: 0;
  }
`

// Shared look of text inputs, selects and textareas.
export const fieldStyles = css`
  font-family: ${theme.fonts.hanken};
  padding: 10px 14px;
  font-size: 0.9375rem;
  border: 1px solid ${theme.colors.borderStrong};
  border-radius: ${theme.radius.sm};
  background-color: ${theme.colors.inputBg};
  color: ${theme.colors.text};
  outline: none;
  width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: ${theme.colors.textMuted};
  }

  &:hover:not(:disabled) {
    border-color: ${theme.colors.textMuted};
  }

  &:focus,
  &:focus-visible {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primarySoft};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const GlobalStyles = createGlobalStyle`
  :root,
  :root[data-theme='dark'] {
    color-scheme: dark;
    ${toCssVars(dark)}
  }

  :root[data-theme='light'] {
    color-scheme: light;
    ${toCssVars(light)}
  }

  @media (prefers-color-scheme: light) {
    :root:not([data-theme]) {
      color-scheme: light;
      ${toCssVars(light)}
    }
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    background: ${theme.colors.bg};
  }

  body {
    font-family: ${theme.fonts.hanken};
    background: ${theme.colors.bgGradient} fixed;
    color: ${theme.colors.text};
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  :focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: none;
  }

  ::selection {
    background: ${theme.colors.primary};
    color: ${theme.colors.onPrimary};
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`

declare module 'styled-components' {
  // Module augmentation requires an interface, so it is empty on purpose.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends Theme {}
}
