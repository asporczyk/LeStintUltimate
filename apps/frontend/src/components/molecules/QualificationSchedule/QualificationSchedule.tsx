import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { Loader } from 'components/atoms/Loader/Loader'
import { EditQualificationModal } from '../EditQualificationModal/EditQualificationModal'
import { QualificationApi, type Qualification } from 'api/QualificationApi'
import {
  ScheduleContainer,
  ScheduleTitle,
  EmptyState
} from '../StintSchedule/StintSchedule.styles'
import EditIcon from 'assets/svg/edit.svg'
import { ScheduleCard, TireMap } from '../StintSchedule/ScheduleCard'
import { CardList } from '../StintSchedule/ScheduleCard.styles'
import { useSocket } from '@/hooks/useSocket'
import { addMinutesToClock, formatClock } from 'utils/time'
import { useToast } from '@/hooks/useToast'
import { type DriverPace } from 'types/Race'
import { driverPace as paceOfDriver } from 'utils/pace'

interface QualificationScheduleProps {
  raceId: string
  raceStartTime: string
  tireSets: number
  avgLapTime: number
  avgFuelPerLap: number
  driverPace?: DriverPace[]
  drivers: string[]
  onCalculatedRaceStart?: (calculatedStartTime: string) => void
}

export function QualificationSchedule({ raceId, raceStartTime, tireSets, avgLapTime: raceAvgLapTime, avgFuelPerLap: raceAvgFuelPerLap, driverPace, drivers, onCalculatedRaceStart }: QualificationScheduleProps) {
  const { t } = useTranslation('raceDetails')
  const { showError } = useToast()
  const [qualification, setQualification] = useState<Qualification | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const { onQualificationUpdated } = useSocket()
  const racePace = { avgLapTime: raceAvgLapTime, avgFuelPerLap: raceAvgFuelPerLap, driverPace }
  // The qualifying driver's pace, else the race's.
  const { avgLapTime, avgFuelPerLap } = paceOfDriver(racePace, qualification?.driver ?? '')

  useEffect(() => {
    const loadQualification = async () => {
      try {
        const data = await QualificationApi.getByRaceId(raceId)
        setQualification(data)
      } catch {
        setQualification(null)
      } finally {
        setLoading(false)
      }
    }
    loadQualification()
  }, [raceId])

  useEffect(() => {
    const unsubscribe = onQualificationUpdated((updatedQualification) => {
      if (updatedQualification.raceId === raceId) {
        setQualification(updatedQualification)
      }
    })
    return unsubscribe
  }, [raceId, onQualificationUpdated])

  const handleCreate = async (data: Partial<Qualification>) => {
    try {
      const created = await QualificationApi.create(raceId, data)
      setQualification(created)
    } catch (err) {
      console.error('Failed to create qualification', err)
      showError(t('save-failed', { ns: 'common' }))
    }
  }

  const handleUpdate = async (updated: Partial<Qualification>) => {
    try {
      const updatedQual = await QualificationApi.update(raceId, updated)
      setQualification(updatedQual)
    } catch (err) {
      console.error('Failed to update qualification', err)
      showError(t('save-failed', { ns: 'common' }))
    }
  }

  // Race starts 2 minutes after qualification ends (duration + one extra lap), as "HH:MM".
  const calculatedRaceStartTime = qualification?.duration
    ? addMinutesToClock(qualification.startTime || raceStartTime, qualification.duration + avgLapTime / 60 + 2).slice(0, 5)
    : raceStartTime

  useEffect(() => {
    if (onCalculatedRaceStart && qualification) {
      onCalculatedRaceStart(calculatedRaceStartTime)
    }
  }, [qualification, onCalculatedRaceStart, calculatedRaceStartTime])

  const availableTires = Math.max(0, tireSets - 4)
  const calculatedLaps = useMemo(() => {
    if (avgLapTime <= 0 || !qualification?.duration) return 0
    const totalSeconds = qualification.duration * 60
    const fullLaps = Math.floor(totalSeconds / avgLapTime)
    const remainingSeconds = totalSeconds % avgLapTime
    return fullLaps + (remainingSeconds > 0 ? 1 : 0)
  }, [avgLapTime, qualification?.duration])

  const calculatedFuel = avgFuelPerLap > 0 && qualification?.laps !== undefined ? Math.ceil(qualification.laps * avgFuelPerLap) : 0

  const qualStartTime = qualification?.startTime ?? raceStartTime
  const displayEndTime = qualification?.duration 
    ? addMinutesToClock(qualStartTime, qualification.duration + avgLapTime / 60)
    : addMinutesToClock(qualStartTime, 30 + avgLapTime / 60)

  if (loading) {
    return (
      <ScheduleContainer>
        <ScheduleTitle>{t('qualificationSchedule')}</ScheduleTitle>
        <Loader />
      </ScheduleContainer>
    )
  }

  if (!qualification) {
    return (
      <ScheduleContainer>
        <ScheduleTitle>{t('qualificationSchedule')}</ScheduleTitle>
        <EmptyState>
          <p>{t('noQualification')}</p>
          <TextButton onClick={() => setEditModalOpen(true)}>
            {t('addQualification')}
          </TextButton>
        </EmptyState>
        <EditQualificationModal
          key={editModalOpen ? 'open' : 'closed'}
          isOpen={editModalOpen}
          qualification={null}
          raceStartTime={raceStartTime}
          racePace={racePace}
          drivers={drivers}
          onConfirm={(updated) => {
            handleCreate(updated)
            setEditModalOpen(false)
          }}
          onCancel={() => setEditModalOpen(false)}
        />
      </ScheduleContainer>
    )
  }

  return (
    <ScheduleContainer>
      <ScheduleTitle>{t('qualificationSchedule')}</ScheduleTitle>
      <CardList>
        <ScheduleCard
          start={formatClock(qualStartTime)}
          end={displayEndTime}
          duration={`${qualification.duration || '30'} min ${t('extraLap')}`}
          driver={qualification.driver}
          spotter={qualification.spotter}
          stats={[
            { label: t('laps'), value: calculatedLaps },
            { label: t('fuel'), value: `${calculatedFuel}%` },
            { label: t('tireChange'), value: <TireMap fl="N" fr="N" rl="N" rr="N" /> },
            { label: t('tiresLeft'), value: availableTires },
          ]}
          actions={<IconButton onClick={() => setEditModalOpen(true)} title={t('edit')} icon={EditIcon} size="sm" />}
        />
      </CardList>
      <EditQualificationModal
        key={editModalOpen ? 'open' : 'closed'}
        isOpen={editModalOpen}
        qualification={qualification}
        raceStartTime={raceStartTime}
        racePace={racePace}
        drivers={drivers}
        onConfirm={(updated) => {
          if (qualification) {
            handleUpdate(updated)
          } else {
            handleCreate(updated)
          }
          setEditModalOpen(false)
        }}
        onCancel={() => setEditModalOpen(false)}
      />
    </ScheduleContainer>
  )
}
