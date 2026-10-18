import { useTranslation } from 'react-i18next'
import { RacesDashboard } from 'components/organisms/RacesDashboard/RacesDashboard'
import { Subtitle } from 'components/atoms/Typography/Typography.styles'
import { ThemeToggle } from 'components/atoms/ThemeToggle/ThemeToggle'
import { Landing, LandingContent, TopBar, Hero, HeroTitle, Stripe, Version } from 'pages/HomePage.styles'

export function HomePage() {
  const { t } = useTranslation('home')

  return (
    <Landing>
      <TopBar>
        <ThemeToggle />
      </TopBar>
      <LandingContent>
        <Hero>
          <HeroTitle>
            {t('title')}
            <Version>2.0</Version>
          </HeroTitle>
          <Stripe aria-hidden="true" />
          <Subtitle>{t('subtitle')}</Subtitle>
        </Hero>
        <RacesDashboard />
      </LandingContent>
    </Landing>
  )
}
