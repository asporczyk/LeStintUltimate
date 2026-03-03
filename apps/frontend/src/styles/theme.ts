import { createGlobalStyle } from 'styled-components'

export interface Theme {
  colors: {
    primary: string
    bgDark: string
    bgDarkMid: string
    border: string
    text: string
    textSecondary: string
    textMuted: string
    textPlaceholder: string
  }
  fonts: {
    anton: string
    hanken: string
  }
}

export const theme: Theme = {
  colors: {
    primary: '#FF1D44',
    bgDark: '#000833',
    bgDarkMid: '#001244',
    border: '#334466',
    text: '#fff',
    textSecondary: '#8899aa',
    textMuted: '#667788',
    textPlaceholder: '#556677',
  },
  fonts: {
    anton: "'Anton', sans-serif",
    hanken: "'Hanken Grotesk', sans-serif",
  },
}

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600&display=swap');

  :root {
    --primary: ${theme.colors.primary};
    --bg-dark: ${theme.colors.bgDark};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${theme.fonts.hanken};
    background: linear-gradient(180deg, #000833 0%, #001244 50%, #000833 100%);
    color: ${theme.colors.text};
    min-height: 100vh;
  }
`

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
