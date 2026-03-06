import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PageTitle, RaceDetailsContainer } from './RaceDetailsPage.styles'
import { Loader } from 'components/atoms/Loader/Loader'
import { BodyM } from 'components/atoms/Typography/Typography.styles'
import { IconTextButton } from 'components/atoms/IconTextButton/IconTextButton'
import { RacesApi } from 'api/RacesApi'
import { type Race } from 'types/Race'
import ArrowBackIcon from 'assets/svg/arrow-back.svg'

export function RaceDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('raceDetails')
  const [race, setRace] = useState<Race | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRace = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await RacesApi.getById(id)
        setRace(data)
      } catch (err) {
        setError(t('failedToLoad'))
      } finally {
        setLoading(false)
      }
    }
    fetchRace()
  }, [id, t])

  if (loading) {
    return (
      <RaceDetailsContainer>
        <Loader />
      </RaceDetailsContainer>
    )
  }

  if (error || !race) {
    return (
      <RaceDetailsContainer>
        <PageTitle>{error || t('notFound')}</PageTitle>
      </RaceDetailsContainer>
    )
  }

  return (
    <RaceDetailsContainer>
      <IconTextButton 
        icon={ArrowBackIcon} 
        onClick={() => navigate(-1)} 
        style={{ position: 'absolute', top: '1rem', left: '1rem' }}
      >
        {t('back')}
      </IconTextButton>
      <PageTitle>{race.name}</PageTitle>
      <BodyM>{t('created')}: {new Date(race.createdAt).toLocaleDateString('pl-PL')}</BodyM>
      <BodyM>{t('startDate')}: {race.startDate ? new Date(race.startDate).toLocaleDateString('pl-PL') : t('notSet')}</BodyM>
    </RaceDetailsContainer>
  )
}
