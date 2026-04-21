import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { type Qualification } from 'types/Race'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import { EditQualificationModal } from '../EditQualificationModal/EditQualificationModal'
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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

function formatEndTime(startTime: string, durationMinutes: number): string {
  const [hours, mins] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + durationMinutes
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMins = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}:00`
}

interface QualificationScheduleProps {
  qualification: Qualification | undefined
  raceStartTime: string
  tireSets: number
  avgLapTime: number
  avgFuelPerLap: number
  drivers: string[]
  onQualificationUpdate: (qualification: Qualification, newRaceStartTime?: string) => void
  showEditButton?: boolean
}

export function QualificationSchedule({ qualification, raceStartTime, tireSets, avgLapTime, avgFuelPerLap, drivers, onQualificationUpdate, showEditButton = true }: QualificationScheduleProps) {
  const { t } = useTranslation('raceDetails')
  const [editModalOpen, setEditModalOpen] = useState(false)

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
    ? formatEndTime(qualStartTime, qualification.duration)
    : formatEndTime(qualStartTime, 30)

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
              <TableCell>{qualification?.duration || '30'} min</TableCell>
              <TableCell>{displayEndTime}</TableCell>
              <TableCell>{calculatedLaps}</TableCell>
              <DriverCell>{qualification?.driver || '-'}</DriverCell>
              <TableCell>{qualification?.spotter || '-'}</TableCell>
              <TableCell>{calculatedFuel}%</TableCell>
              <TableCell><CheckIcon /></TableCell>
              <TableCell><CheckIcon /></TableCell>
              <TableCell><CheckIcon /></TableCell>
              <TableCell><CheckIcon /></TableCell>
              <TableCell>{availableTires}</TableCell>
              <ActionsCell>
                <ActionButtonsWrapper>
                  {showEditButton && (
                    <IconButton 
                      onClick={() => setEditModalOpen(true)} 
                      title={t('edit')} 
                      icon={EditIcon} 
                    />
                  )}
                </ActionButtonsWrapper>
              </ActionsCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableWrapper>
      <EditQualificationModal
        isOpen={editModalOpen}
        qualification={qualification!}
        raceStartTime={raceStartTime}
        avgLapTime={avgLapTime}
        avgFuelPerLap={avgFuelPerLap}
        drivers={drivers}
        onConfirm={(updated, newRaceStartTime) => {
          onQualificationUpdate(updated, newRaceStartTime)
          setEditModalOpen(false)
        }}
        onCancel={() => setEditModalOpen(false)}
      />
    </ScheduleContainer>
  )
}