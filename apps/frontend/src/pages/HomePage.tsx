import { useTranslation } from 'react-i18next'
import { RacesDashboard } from 'components/organisms/RacesDashboard/RacesDashboard'
import { Title, Subtitle } from 'components/atoms/Typography/Typography.styles'
import { Landing, LandingContent } from 'pages/HomePage.styles'

export function HomePage() {
  const { t } = useTranslation('home')

  return (
    <Landing>
      <LandingContent>
        <Title>{t('title')}</Title>
        <Subtitle>{t('subtitle')}</Subtitle>
        <RacesDashboard />
      </LandingContent>
    </Landing>
  )
}
