import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  PageTitle,
  RaceDetailsContainer,
  TopBar,
  TopBarActions,
  RaceHeader,
  RaceMeta,
  StatsGrid,
  Stat,
  StatLabel,
  StatValue,
  DriverList,
  DriverTag,
  ErrorState
} from './RaceDetailsPage.styles'
import { Loader } from 'components/atoms/Loader/Loader'
import { IconTextButton } from 'components/atoms/IconTextButton/IconTextButton'
import { ThemeToggle } from 'components/atoms/ThemeToggle/ThemeToggle'
import { StintSchedule } from 'components/molecules/StintSchedule/StintSchedule'
import { TrainingSchedule } from 'components/molecules/TrainingSchedule/TrainingSchedule'
import { QualificationSchedule } from 'components/molecules/QualificationSchedule/QualificationSchedule'
import { EditRaceModal } from 'components/molecules/EditRaceModal/EditRaceModal'
import { RacesApi } from 'api/RacesApi'
import { useSocket } from '@/hooks/useSocket'
import { type Race } from 'types/Race'
import ArrowBackIcon from 'assets/svg/arrow-back.svg'
import EditIcon from 'assets/svg/edit.svg'
import { formatLapTime } from 'utils/time'
import { useToast } from '@/hooks/useToast'

export function RaceDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('raceDetails')
  const { showError } = useToast()
  const [race, setRace] = useState<Race | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [calculatedRaceStartTime, setCalculatedRaceStartTime] = useState<string | null>(null)
  const [trainingEndTime, setTrainingEndTime] = useState<string | null>(null)
  const { onRaceUpdated, joinRace } = useSocket()

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
    return joinRace(id)
  }, [id, joinRace])

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
      showError(t('save-failed', { ns: 'common' }))
    }
  }

  // Back to the list even when the page was opened from a shared link.
  const goBack = () => navigate('/')

  if (loading) {
    return <Loader fullPage />
  }

  if (error || !race) {
    return (
      <RaceDetailsContainer>
        <ErrorState>
          <p>{error || t('notFound')}</p>
          <IconTextButton icon={ArrowBackIcon} onClick={goBack}>{t('back')}</IconTextButton>
        </ErrorState>
      </RaceDetailsContainer>
    )
  }

  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString(i18n.language)
  const stats = [
    { label: t('startDate'), value: race.startDate ? `${formatDate(race.startDate)} ${race.startTime || '19:30'}` : t('notSet') },
    { label: t('raceLength'), value: `${race.raceLength} h` },
    { label: t('tireSets'), value: race.tireSets },
    { label: t('fuelTankCapacity'), value: `${race.fuelTankCapacity} L` },
    { label: t('avgLapTime'), value: race.avgLapTime ? formatLapTime(race.avgLapTime) : '-' },
    { label: t('avgFuelPerLap'), value: `${race.avgFuelPerLap}%` },
    { label: t('avgStintTime'), value: `${race.avgStintTime} min` },
  ]

  return (
    <RaceDetailsContainer>
      <TopBar>
        <IconTextButton icon={ArrowBackIcon} onClick={goBack}>
          {t('back')}
        </IconTextButton>
        <TopBarActions>
          <ThemeToggle />
          <IconTextButton icon={EditIcon} onClick={() => setIsEditModalOpen(true)}>
            {t('editRace')}
          </IconTextButton>
        </TopBarActions>
      </TopBar>
      <RaceHeader>
        <PageTitle>{race.name}</PageTitle>
        <RaceMeta>{t('created')}: {formatDate(race.createdAt)}</RaceMeta>
      </RaceHeader>
      <StatsGrid aria-label={t('raceSettings')}>
        {stats.map(({ label, value }) => (
          <Stat key={label}>
            <StatLabel>{label}</StatLabel>
            <StatValue>{value}</StatValue>
          </Stat>
        ))}
        <Stat $wide>
          <StatLabel>{t('drivers')}</StatLabel>
          <DriverList>
            {race.drivers?.length
              ? race.drivers.map(driver => <DriverTag key={driver}>{driver}</DriverTag>)
              : '-'}
          </DriverList>
        </Stat>
      </StatsGrid>
      {race && <TrainingSchedule 
        raceId={race._id}
        raceStartTime={race.startTime} 
        onTrainingStartTime={setTrainingEndTime}
      />}
      {race && <QualificationSchedule 
        raceId={race._id}
        raceStartTime={trainingEndTime || race.startTime} 
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
        raceDate={race.startDate}
        eventStartTime={race.startTime || '19:30'}
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
