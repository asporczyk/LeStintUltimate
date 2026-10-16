import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { Loader } from 'components/atoms/Loader/Loader'
import { EditTrainingModal } from '../EditTrainingModal/EditTrainingModal'
import { TrainingApi, type Training } from 'api/TrainingApi'
import { useSocket } from '@/hooks/useSocket'
import {
  ScheduleContainer,
  ScheduleTitle,
  EmptyState
} from '../StintSchedule/StintSchedule.styles'
import EditIcon from 'assets/svg/edit.svg'
import { ScheduleCard } from '../StintSchedule/ScheduleCard'
import { CardList } from '../StintSchedule/ScheduleCard.styles'
import { addMinutesToClock, formatClock } from 'utils/time'
import { useToast } from '@/hooks/useToast'

interface TrainingScheduleProps {
  raceId: string
  raceStartTime: string
  onTrainingStartTime?: (trainingEndTime: string) => void
}

export function TrainingSchedule({ raceId, raceStartTime, onTrainingStartTime }: TrainingScheduleProps) {
  const { t } = useTranslation('raceDetails')
  const { showError } = useToast()
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
      const endTime = addMinutesToClock(training.startTime || raceStartTime, training.duration)
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
      showError(t('save-failed', { ns: 'common' }))
    }
  }

  const handleUpdate = async (updated: Partial<Training>) => {
    try {
      const updatedTraining = await TrainingApi.update(raceId, updated)
      setTraining(updatedTraining)
    } catch (err) {
      console.error('Failed to update training', err)
      showError(t('save-failed', { ns: 'common' }))
    }
  }

  const trainingStartTime = training?.startTime ?? raceStartTime
  const displayEndTime = training?.duration 
    ? addMinutesToClock(trainingStartTime, training.duration)
    : addMinutesToClock(trainingStartTime, 30)

  if (loading) {
    return (
      <ScheduleContainer>
        <ScheduleTitle>{t('trainingSchedule')}</ScheduleTitle>
        <Loader />
      </ScheduleContainer>
    )
  }

  if (!training) {
    return (
      <ScheduleContainer>
        <ScheduleTitle>{t('trainingSchedule')}</ScheduleTitle>
        <EmptyState>
          <p>{t('noTraining')}</p>
          <TextButton onClick={() => setEditModalOpen(true)}>
            {t('addTraining')}
          </TextButton>
        </EmptyState>
        <EditTrainingModal
          key={editModalOpen ? 'open' : 'closed'}
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
      <CardList>
        <ScheduleCard
          start={formatClock(trainingStartTime)}
          end={displayEndTime}
          duration={`${training.duration || '30'} min`}
          actions={<IconButton onClick={() => setEditModalOpen(true)} title={t('edit')} icon={EditIcon} size="sm" />}
        />
      </CardList>
      <EditTrainingModal
        key={editModalOpen ? 'open' : 'closed'}
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