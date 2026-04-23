import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { EditTrainingModal } from '../EditTrainingModal/EditTrainingModal'
import { TrainingApi, type Training } from 'api/TrainingApi'
import { useSocket } from '@/hooks/useSocket'
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
  ActionsCell,
  ActionButtonsWrapper
} from '../StintSchedule/StintSchedule.styles'
import EditIcon from 'assets/svg/edit.svg'

function formatEndTime(startTime: string, durationMinutes: number): string {
  const [hours, mins] = startTime.split(':').map(Number)
  const totalSeconds = hours * 3600 + mins * 60 + durationMinutes * 60
  const newHours = Math.floor(totalSeconds / 3600) % 24
  const newMins = Math.floor((totalSeconds % 3600) / 60)
  const newSecs = totalSeconds % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`
}

interface TrainingScheduleProps {
  raceId: string
  raceStartTime: string
  onTrainingStartTime?: (trainingEndTime: string) => void
}

export function TrainingSchedule({ raceId, raceStartTime, onTrainingStartTime }: TrainingScheduleProps) {
  const { t } = useTranslation('raceDetails')
  const [training, setTraining] = useState<Training | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const { onTrainingUpdated } = useSocket()

  useEffect(() => {
    const loadTraining = async () => {
      try {
        const data = await TrainingApi.getByRaceId(raceId)
        setTraining(data)
      } catch {
        setTraining(null)
      } finally {
        setLoading(false)
      }
    }
    loadTraining()
  }, [raceId])

  useEffect(() => {
    if (onTrainingStartTime && training?.duration) {
      const endTime = formatEndTime(training.startTime || raceStartTime, training.duration)
      onTrainingStartTime(endTime)
    }
  }, [training, onTrainingStartTime, raceStartTime])

  useEffect(() => {
    const unsubscribe = onTrainingUpdated((updatedTraining) => {
      if (updatedTraining.raceId === raceId) {
        setTraining(updatedTraining)
      }
    })
    return unsubscribe
  }, [raceId, onTrainingUpdated])

  const handleCreate = async (data: Partial<Training>) => {
    try {
      const created = await TrainingApi.create(raceId, data)
      setTraining(created)
    } catch (err) {
      console.error('Failed to create training', err)
    }
  }

  const handleUpdate = async (updated: Partial<Training>) => {
    try {
      const updatedTraining = await TrainingApi.update(raceId, updated)
      setTraining(updatedTraining)
    } catch (err) {
      console.error('Failed to update training', err)
    }
  }

  const trainingStartTime = training?.startTime ?? raceStartTime
  const displayEndTime = training?.duration 
    ? formatEndTime(trainingStartTime, training.duration)
    : formatEndTime(trainingStartTime, 30)

  if (loading) {
    return (
      <ScheduleContainer>
        <ScheduleTitle>{t('trainingSchedule')}</ScheduleTitle>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading...</p>
        </div>
      </ScheduleContainer>
    )
  }

  if (!training) {
    return (
      <ScheduleContainer>
        <ScheduleTitle>{t('trainingSchedule')}</ScheduleTitle>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>{t('noTraining')}</p>
          <TextButton onClick={() => setEditModalOpen(true)}>
            {t('addTraining')}
          </TextButton>
        </div>
        <EditTrainingModal
          isOpen={editModalOpen}
          training={null}
          raceStartTime={raceStartTime}
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
      <ScheduleTitle>{t('trainingSchedule')}</ScheduleTitle>
      <TableWrapper>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>{t('startTime')}</TableHeader>
              <TableHeader>{t('duration')}</TableHeader>
              <TableHeader>{t('endTime')}</TableHeader>
              <TableHeader></TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{trainingStartTime}:00</TableCell>
              <TableCell>{training.duration || '30'} min</TableCell>
              <TableCell>{displayEndTime}</TableCell>
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
      <EditTrainingModal
        isOpen={editModalOpen}
        training={training}
        raceStartTime={raceStartTime}
        onConfirm={(updated) => {
          handleUpdate(updated)
          setEditModalOpen(false)
        }}
        onCancel={() => setEditModalOpen(false)}
      />
    </ScheduleContainer>
  )
}