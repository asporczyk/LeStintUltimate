import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { type Stint } from 'types/Schedule'
import { addMinutesToClock } from 'utils/time'
import { remainingTiresAt } from 'utils/tires'
import { stintStartLap } from 'utils/laps'
import { stintStartTimes } from 'utils/schedule'
import { minutesSinceRaceStart, raceStartDateTime } from 'utils/raceClock'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useSocket } from '@/hooks/useSocket'
import { AddStintModal } from 'components/molecules/AddStintModal/AddStintModal'
import { EditStintModal } from 'components/molecules/EditStintModal/EditStintModal'
import { ConfirmModal } from 'components/molecules/ConfirmModal/ConfirmModal'
import { StintsApi } from 'api/StintsApi'
import { ScheduleApi } from 'api/ScheduleApi'
import { ScheduleCard, TireMap } from './ScheduleCard'
import { CardList } from './ScheduleCard.styles'
import { InsertDivider } from './InsertDivider'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import EditIcon from 'assets/svg/edit.svg'
import TrashIcon from 'assets/svg/trash.svg'
import { NotesEditor } from './NotesEditor'
import { DriverSummary } from './DriverSummary'
import {
  ScheduleContainer,
  ScheduleTitle,
  EmptyState
} from './StintSchedule.styles'
import { useToast } from '@/hooks/useToast'

interface StintScheduleProps {
  drivers: string[]
  avgStintTime: number
  avgLapTime: number
  raceId: string
  startTime: string
  raceDate: string | Date
  eventStartTime: string
  tireSets: number
  fuelTankCapacity: number
  notes?: string
}

export function StintSchedule({ drivers, avgStintTime, avgLapTime, raceId, startTime, raceDate, eventStartTime, tireSets, fuelTankCapacity, notes }: StintScheduleProps) {
  const { t } = useTranslation('raceDetails')
  const { showError } = useToast()
  const { onStintRefresh } = useSocket()
  const [stints, setStints] = useState<Stint[]>([])
  // Re-render every minute so the active stint follows the clock.
  const [now, setNow] = useState(() => new Date())
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addAfterStint, setAddAfterStint] = useState(0)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [deletingStint, setDeletingStint] = useState<Stint | null>(null)

  useEffect(() => {
    if (!raceId) return
    ScheduleApi.getByRaceId(raceId)
      .then(data => setStints(data.stints))
      .catch(err => {
        console.error('Failed to load stints', err)
        showError(t('load-failed', { ns: 'common' }))
      })
  }, [raceId, showError, t])

  useEffect(() => {
    return onStintRefresh((data) => {
      if (data.raceId !== raceId) return
      ScheduleApi.getByRaceId(raceId)
        .then(data => setStints(data.stints))
        .catch(err => {
        console.error('Failed to refresh stints', err)
        showError(t('load-failed', { ns: 'common' }))
      })
    })
  }, [raceId, onStintRefresh, showError, t])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const currentRaceTime = minutesSinceRaceStart(raceStartDateTime(raceDate, eventStartTime, startTime), now)
  const startTimes = stintStartTimes(stints, fuelTankCapacity)
  const editingStint = editingIndex !== null ? stints[editingIndex] : null

  const openAddModal = (afterOrder: number) => {
    setAddAfterStint(afterOrder)
    setAddModalOpen(true)
  }

  const rows = stints.map((stint, index) => {
    const start = startTimes[index]
    const end = start + stint.duration
    return {
      stint,
      index,
      order: stint.order ?? index + 1,
      startClock: addMinutesToClock(startTime, start),
      endClock: addMinutesToClock(startTime, end),
      isActive: currentRaceTime >= start && currentRaceTime < end,
      remainingTires: remainingTiresAt(stints, index, tireSets),
    }
  })

  const startLapBefore = (index: number) => stintStartLap(stints.slice(0, index).map(s => s.duration), avgLapTime)

  return (
    <ScheduleContainer>
      <ScheduleTitle>{t('stintSchedule')}</ScheduleTitle>
      {stints.length === 0 ? (
        <EmptyState>
          <p>{t('noStints')}</p>
          <TextButton onClick={() => openAddModal(0)}>
            {t('addFirstStint')}
          </TextButton>
        </EmptyState>
      ) : (
        <CardList>
          {rows.map(row => (
            <div key={row.stint._id}>
              <ScheduleCard
                badge={row.order}
                start={row.startClock}
                end={row.endClock}
                duration={`${row.stint.duration} min`}
                isActive={row.isActive}
                driver={row.stint.driver}
                spotter={row.stint.spotter}
                stats={[
                  { label: t('startLapShort'), value: row.stint.fuelLaps },
                  { label: t('fuel'), value: `${row.stint.fuel}%` },
                  {
                    label: t('tireChange'),
                    value: (
                      <TireMap
                        fl={row.stint.tireFL !== '-'}
                        fr={row.stint.tireFR !== '-'}
                        rl={row.stint.tireRL !== '-'}
                        rr={row.stint.tireRR !== '-'}
                      />
                    ),
                  },
                  { label: t('tiresLeft'), value: row.remainingTires },
                ]}
                actions={
                  <>
                    <IconButton onClick={() => setEditingIndex(row.index)} title={t('edit')} icon={EditIcon} size="sm" />
                    <IconButton onClick={() => setDeletingStint(row.stint)} title={t('delete')} icon={TrashIcon} size="sm" />
                  </>
                }
              />
              <InsertDivider inset after={row.order} onInsert={() => openAddModal(row.order)} />
            </div>
          ))}
        </CardList>
      )}
      <AddStintModal
        key={addModalOpen ? `open-${addAfterStint}` : 'closed'}
        isOpen={addModalOpen}
        insertAfterStint={addAfterStint}
        totalStints={stints.length}
        raceId={raceId}
        drivers={drivers}
        avgStintTime={avgStintTime}
        startLap={startLapBefore(addAfterStint)}
        onStintAdded={() => setAddModalOpen(false)}
        onCancel={() => setAddModalOpen(false)}
      />
      {editingStint && editingIndex !== null && (
        <EditStintModal
          key={`open-${editingStint._id}`}
          isOpen
          stint={editingStint}
          drivers={drivers}
          avgStintTime={avgStintTime}
          startLap={startLapBefore(editingIndex)}
          onConfirm={async (updatedStint) => {
            try {
              const updated = await StintsApi.update(editingStint._id, updatedStint)
              setStints(prev => prev.map(s => s._id === editingStint._id ? updated : s))
              setEditingIndex(null)
            } catch (err) {
              console.error('Failed to update stint', err)
              showError(t('save-failed', { ns: 'common' }))
            }
          }}
          onCancel={() => setEditingIndex(null)}
        />
      )}
      <ConfirmModal
        isOpen={deletingStint !== null}
        title={t('deleteStint')}
        message={t('confirmDeleteStint')}
        onConfirm={async () => {
          if (!deletingStint) return
          try {
            await StintsApi.delete(deletingStint._id)
            setStints(prev => prev.filter(s => s._id !== deletingStint._id))
            setDeletingStint(null)
          } catch (err) {
            console.error('Failed to delete stint', err)
            showError(t('delete-failed', { ns: 'common' }))
          }
        }}
        onCancel={() => setDeletingStint(null)}
      />
      <NotesEditor raceId={raceId} notes={notes} />
      {stints.length > 0 && drivers.length > 0 && (
        <DriverSummary stints={stints} drivers={drivers} fuelTankCapacity={fuelTankCapacity} />
      )}
    </ScheduleContainer>
  )
}
