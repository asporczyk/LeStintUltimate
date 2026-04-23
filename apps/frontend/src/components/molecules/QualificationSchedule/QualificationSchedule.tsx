import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { EditQualificationModal } from '../EditQualificationModal/EditQualificationModal'
import { QualificationApi, type Qualification } from 'api/QualificationApi'
import {
  ScheduleContainer,
  ScheduleTitle,
  TableWrapper,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  DriverCell,
  ActionsCell,
  ActionButtonsWrapper
} from '../StintSchedule/StintSchedule.styles'
import EditIcon from 'assets/svg/edit.svg'
import { useSocket } from '@/hooks/useSocket'

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

function formatEndTime(startTime: string, durationMinutes: number, extraLapSeconds: number = 0): string {
  const [hours, mins] = startTime.split(':').map(Number)
  const totalSeconds = hours * 3600 + mins * 60 + durationMinutes * 60 + extraLapSeconds
  const newHours = Math.floor(totalSeconds / 3600) % 24
  const newMins = Math.floor((totalSeconds % 3600) / 60)
  const newSecs = totalSeconds % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`
}

interface QualificationScheduleProps {
  raceId: string
  raceStartTime: string
  tireSets: number
  avgLapTime: number
  avgFuelPerLap: number
  drivers: string[]
  onCalculatedRaceStart?: (calculatedStartTime: string) => void
}

export function QualificationSchedule({ raceId, raceStartTime, tireSets, avgLapTime, avgFuelPerLap, drivers, onCalculatedRaceStart }: QualificationScheduleProps) {
  const { t } = useTranslation('raceDetails')
  const [qualification, setQualification] = useState<Qualification | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const { onQualificationUpdated } = useSocket()

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
    }
  }

  const handleUpdate = async (updated: Partial<Qualification>) => {
    try {
      const updatedQual = await QualificationApi.update(raceId, updated)
      setQualification(updatedQual)
    } catch (err) {
      console.error('Failed to update qualification', err)
    }
  }

  const calculatedRaceStartTime = (() => {
    if (!qualification?.duration) return raceStartTime
    const [h, m] = (qualification.startTime || raceStartTime).split(':').map(Number)
    const qualEndSeconds = h * 3600 + m * 60 + qualification.duration * 60 + avgLapTime
    const twoMinutesLater = qualEndSeconds + 2 * 60
    const newHours = Math.floor(twoMinutesLater / 3600) % 24
    const newMins = Math.floor((twoMinutesLater % 3600) / 60)
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  })()

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
    ? formatEndTime(qualStartTime, qualification.duration, avgLapTime)
    : formatEndTime(qualStartTime, 30, avgLapTime)

if (loading) {
    return (
      <ScheduleContainer>
        <ScheduleTitle>{t('qualificationSchedule')}</ScheduleTitle>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading...</p>
        </div>
      </ScheduleContainer>
    )
  }

  if (!qualification) {
    return (
      <ScheduleContainer>
        <ScheduleTitle>{t('qualificationSchedule')}</ScheduleTitle>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>{t('noQualification')}</p>
          <TextButton onClick={() => setEditModalOpen(true)}>
            {t('addQualification')}
          </TextButton>
        </div>
        <EditQualificationModal
          isOpen={editModalOpen}
          qualification={null}
          raceStartTime={raceStartTime}
          avgLapTime={avgLapTime}
          avgFuelPerLap={avgFuelPerLap}
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
      <TableWrapper>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>{t('startTime')}</TableHeader>
              <TableHeader>{t('duration')}</TableHeader>
              <TableHeader>{t('endTime')}</TableHeader>
              <TableHeader>{t('laps')}</TableHeader>
              <TableHeader>{t('driver')}</TableHeader>
              <TableHeader>{t('spotter')}</TableHeader>
              <TableHeader>{t('fuel')}</TableHeader>
              <TableHeader>FL</TableHeader>
              <TableHeader>FR</TableHeader>
              <TableHeader>RL</TableHeader>
              <TableHeader>RR</TableHeader>
              <TableHeader>{t('tires')}</TableHeader>
              <TableHeader></TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{qualStartTime}:00</TableCell>
              <TableCell>
                {qualification.duration || '30'} min
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>+1 lap</div>
              </TableCell>
              <TableCell>{displayEndTime}</TableCell>
              <TableCell>{calculatedLaps}</TableCell>
              <DriverCell>{qualification.driver || '-'}</DriverCell>
              <TableCell>{qualification.spotter || '-'}</TableCell>
              <TableCell>{calculatedFuel}%</TableCell>
              <TableCell><CheckIcon /></TableCell>
              <TableCell><CheckIcon /></TableCell>
              <TableCell><CheckIcon /></TableCell>
              <TableCell><CheckIcon /></TableCell>
              <TableCell>{availableTires}</TableCell>
              <ActionsCell>
                <ActionButtonsWrapper>
                  <IconButton 
                    onClick={() => setEditModalOpen(true)} 
                    title={t('edit')} 
                    icon={EditIcon} 
                  />
                </ActionButtonsWrapper>
              </ActionsCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableWrapper>
      <EditQualificationModal
        isOpen={editModalOpen}
        qualification={qualification}
        raceStartTime={raceStartTime}
        avgLapTime={avgLapTime}
        avgFuelPerLap={avgFuelPerLap}
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
