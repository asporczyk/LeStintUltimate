import { useTranslation } from 'react-i18next'
import { RacesDashboard } from 'components/organisms/RacesDashboard/RacesDashboard'
import { Title, Subtitle } from 'components/atoms/Typography/Typography.styles'
import { ThemeToggle } from 'components/atoms/ThemeToggle/ThemeToggle'
import { Landing, LandingContent, TopBar, Hero, Stripe } from 'pages/HomePage.styles'

export function HomePage() {
  const { t } = useTranslation('home')

  return (
    <Landing>
      <TopBar>
        <ThemeToggle />
      </TopBar>
      <LandingContent>
        <Hero>
          <Title>{t('title')}</Title>
          <Stripe aria-hidden="true" />
          <Subtitle>{t('subtitle')}</Subtitle>
        </Hero>
        <RacesDashboard />
      </LandingContent>
    </Landing>
  )
}
