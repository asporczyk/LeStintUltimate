import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PageTitle, RaceDetailsContainer, RaceInfo, HeaderRow, HeaderLeft } from './RaceDetailsPage.styles'
import { Loader } from 'components/atoms/Loader/Loader'
import { BodyM } from 'components/atoms/Typography/Typography.styles'
import { IconTextButton } from 'components/atoms/IconTextButton/IconTextButton'
import { StintSchedule } from 'components/molecules/StintSchedule/StintSchedule'
import { QualificationSchedule } from 'components/molecules/QualificationSchedule/QualificationSchedule'
import { EditRaceModal } from 'components/molecules/EditRaceModal/EditRaceModal'
import { RacesApi } from 'api/RacesApi'
import { useSocket } from '@/hooks/useSocket'
import { type Race } from 'types/Race'
import ArrowBackIcon from 'assets/svg/arrow-back.svg'
import EditIcon from 'assets/svg/edit.svg'

function formatLapTimeDisplay(seconds: number | undefined): string {
  if (!seconds) return '-'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`
}

export function RaceDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('raceDetails')
  const [race, setRace] = useState<Race | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [calculatedRaceStartTime, setCalculatedRaceStartTime] = useState<string | null>(null)
  const { onRaceUpdated } = useSocket()

  useEffect(() => {
    const fetchRace = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await RacesApi.getById(id)
        setRace(data)
      } catch {
        setError(t('failedToLoad'))
      } finally {
        setLoading(false)
      }
    }
    fetchRace()
  }, [id, t])

  useEffect(() => {
    if (!id) return

    const unsubscribe = onRaceUpdated((updatedRace) => {
      if (updatedRace._id === id) {
        setRace(updatedRace)
      }
    })

    return unsubscribe
  }, [id, onRaceUpdated])

  const handleSaveRace = async (updatedData: Partial<Race>) => {
    if (!id || !race) return
    try {
      const updatedRace = await RacesApi.update(id, updatedData)
      setRace(updatedRace)
      setIsEditModalOpen(false)
    } catch {
      console.error('Failed to update race')
    }
  }

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
      <IconTextButton 
        icon={EditIcon} 
        onClick={() => setIsEditModalOpen(true)} 
        style={{ position: 'absolute', top: '1rem', right: '1rem' }}
      >
        {t('editRace')}
      </IconTextButton>
      <HeaderRow>
        <HeaderLeft>
          <PageTitle>{race.name}</PageTitle>
          <RaceInfo>
            <BodyM>{t('created')}: {new Date(race.createdAt).toLocaleDateString('pl-PL')}</BodyM>
            <BodyM>{t('startDate')}: {race.startDate ? new Date(race.startDate).toLocaleDateString('pl-PL') + ' ' + (race.startTime || '19:30') : t('notSet')}</BodyM>
            <BodyM>{t('raceLength')}: {race.raceLength}h</BodyM>
            <BodyM>{t('tireSets')}: {race.tireSets}</BodyM>
            <BodyM>{t('fuelTankCapacity')}: {race.fuelTankCapacity}L</BodyM>
            <BodyM>{t('avgLapTime')}: {formatLapTimeDisplay(race.avgLapTime)}</BodyM>
            <BodyM>{t('avgFuelPerLap')}: {race.avgFuelPerLap}%</BodyM>
            <BodyM>{t('avgStintTime')}: {race.avgStintTime} min</BodyM>
            <BodyM>{t('drivers')}: {race.drivers?.join(', ') || '-'}</BodyM>
          </RaceInfo>
        </HeaderLeft>
      </HeaderRow>
      {race && <QualificationSchedule 
        raceId={race._id}
        raceStartTime={race.startTime} 
        tireSets={race.tireSets || 0}
        avgLapTime={race.avgLapTime || 0}
        avgFuelPerLap={race.avgFuelPerLap || 0}
        drivers={race.drivers || []}
        onCalculatedRaceStart={setCalculatedRaceStartTime}
      />}
      {race && <StintSchedule 
        drivers={race.drivers || []} 
        avgStintTime={race.avgStintTime} 
        avgLapTime={race.avgLapTime} 
        raceId={race._id} 
        startTime={calculatedRaceStartTime || race.startTime || '19:30'} 
        tireSets={Math.max(0, (race.tireSets || 0) - 4)}
        fuelTankCapacity={race.fuelTankCapacity || 100}
        notes={race.notes}
      />}
      {race && (
        <EditRaceModal
          key={isEditModalOpen ? 'open' : 'closed'}
          isOpen={isEditModalOpen}
          race={race}
          onConfirm={handleSaveRace}
          onCancel={() => setIsEditModalOpen(false)}
        />
      )}
    </RaceDetailsContainer>
  )
}
