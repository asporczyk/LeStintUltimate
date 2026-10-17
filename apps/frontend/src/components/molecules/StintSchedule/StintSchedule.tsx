import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { type Stint } from 'types/Schedule'
import { type DriverAvailability } from 'types/Race'
import { availabilityLabel, availabilityWindows, driverBlocks, isAvailable } from 'utils/availability'
import { addMinutesToClock } from 'utils/time'
import { remainingTiresAt } from 'utils/tires'
import { stintStartLap } from 'utils/laps'
import { raceTimeline, maxNewStintDuration, maxStintDuration, finishFuel, newStintMinutesToFlag } from 'utils/raceTimeline'
import { minutesSinceRaceStart, raceStartDateTime } from 'utils/raceClock'
import { calculatePitstopTime } from 'utils/pitstop'
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
import { TimelineItem, FinishItem, RaceStrip } from './RaceTimeline'
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
  driverAvailability?: DriverAvailability[]
  avgStintTime: number
  avgLapTime: number
  avgFuelPerLap: number
  raceId: string
  startTime: string
  raceDate: string | Date
  eventStartTime: string
  tireSets: number
  fuelTankCapacity: number
  raceLength: number
  notes?: string
}

export function StintSchedule({ drivers, driverAvailability, avgStintTime, avgLapTime, avgFuelPerLap, raceId, startTime, raceDate, eventStartTime, tireSets, fuelTankCapacity, raceLength, notes }: StintScheduleProps) {
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
  const timeline = raceTimeline(stints, raceLength, avgLapTime, fuelTankCapacity)
  const editingStint = editingIndex !== null ? stints[editingIndex] : null

  const openAddModal = (afterOrder: number) => {
    setAddAfterStint(afterOrder)
    setAddModalOpen(true)
  }

  const rows = stints.map((stint, index) => {
    const timelineStint = timeline.stints[index]
    const { start, end } = timelineStint
    const toFlag = timelineStint.status === 'finish'
    const availability = driverBlocks(driverAvailability, stint.driver)
    const unavailable = stint.driver && timelineStint.status !== 'after'
      && !isAvailable(availabilityWindows(availability, eventStartTime, startTime), start, end)
    return {
      stint,
      index,
      timelineStint,
      order: stint.order ?? index + 1,
      startClock: addMinutesToClock(startTime, start),
      endClock: addMinutesToClock(startTime, end),
      duration: toFlag ? `${Math.round(end - start)} min · ${t('toFlag')}` : `${stint.duration} min`,
      isActive: currentRaceTime >= start && currentRaceTime < end,
      remainingTires: remainingTiresAt(stints, index, tireSets),
      driverWarning: unavailable
        ? t('driverUnavailable', { window: availabilityLabel(availability, eventStartTime, t) ?? '' })
        : undefined,
    }
  })
  const lastOrder = rows.length ? rows[rows.length - 1].order : 0
  // No new stints once the plan reaches the checkered flag.
  const canInsert = !timeline.coversRace
  const afterFinishOrders = rows.filter(row => row.timelineStint.status === 'after').map(row => row.order)
  // As driven: the finishing stint is cut at the flag and stints after the finish don't count.
  const drivenStints = rows
    .filter(row => row.timelineStint.status !== 'after')
    .map(row => ({ driver: row.stint.driver, duration: row.timelineStint.end - row.timelineStint.start }))
  const drivenEnd = Math.max(0, ...rows.filter(row => row.timelineStint.status !== 'after').map(row => row.timelineStint.end))
  const scrollToStint = (id: string) =>
    document.getElementById(`stint-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  // Where a stint added after `afterOrder` would start (race minutes), after a pit stop
  // with a driver change and a full tank.
  const newStintStart = (afterOrder: number) => {
    const previous = stints[afterOrder - 1]
    if (!previous) return 0
    const pitSeconds = calculatePitstopTime(previous, { ...previous, driver: `${previous.driver}-next`, fuel: 100 }, fuelTankCapacity)
    return timeline.stints[afterOrder - 1].start + previous.duration + pitSeconds / 60
  }

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
        <>
        <CardList $plain>
          {rows.map((row, i) => (
            <div key={row.stint._id} id={`stint-${row.stint._id}`}>
              <TimelineItem
                timelineStint={row.timelineStint}
                raceStartClock={startTime}
                isActive={row.isActive}
                isFirst={i === 0}
                card={
              <ScheduleCard
                badge={row.order}
                start={row.startClock}
                end={row.endClock}
                duration={row.duration}
                isActive={row.isActive}
                driver={row.stint.driver}
                driverWarning={row.driverWarning}
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
                }
                divider={canInsert && row.timelineStint.status !== 'after' && (
                  <InsertDivider after={row.order} onInsert={() => openAddModal(row.order)} />
                )}
              />
            </div>
          ))}
          <FinishItem
            timeline={timeline}
            raceStartClock={startTime}
            afterFinishOrders={afterFinishOrders}
            onAddStint={() => openAddModal(lastOrder)}
          />
        </CardList>
        </>
      )}
      <AddStintModal
        key={addModalOpen ? `open-${addAfterStint}` : 'closed'}
        isOpen={addModalOpen}
        insertAfterStint={addAfterStint}
        totalStints={stints.length}
        raceId={raceId}
        drivers={drivers}
        driverAvailability={driverAvailability}
        eventStartClock={eventStartTime}
        raceStartClock={startTime}
        stintStart={newStintStart(addAfterStint)}
        flagAt={timeline.finish.flagAt}
        avgStintTime={avgStintTime}
        startLap={startLapBefore(addAfterStint)}
        maxDuration={maxNewStintDuration(timeline, stints[addAfterStint - 1] ?? null, fuelTankCapacity)}
        finishFuel={addAfterStint === stints.length && !timeline.coversRace
          ? finishFuel(
            timeline,
            timeline.totalDriving,
            newStintMinutesToFlag(timeline, stints[stints.length - 1] ?? null, fuelTankCapacity),
            avgLapTime,
            avgFuelPerLap,
          )
          : null}
        onStintAdded={() => setAddModalOpen(false)}
        onCancel={() => setAddModalOpen(false)}
      />
      {editingStint && editingIndex !== null && (
        <EditStintModal
          key={`open-${editingStint._id}`}
          isOpen
          stint={editingStint}
          drivers={drivers}
          driverAvailability={driverAvailability}
          eventStartClock={eventStartTime}
          raceStartClock={startTime}
          stintStart={timeline.stints[editingIndex].start}
          flagAt={timeline.finish.flagAt}
          avgStintTime={avgStintTime}
          startLap={startLapBefore(editingIndex)}
          maxDuration={maxStintDuration(timeline, editingIndex, editingStint.duration)}
          finishFuel={timeline.stints[editingIndex].status !== 'after'
            && (editingIndex === timeline.finishingIndex || editingIndex === stints.length - 1)
            ? finishFuel(
              timeline,
              timeline.stints[editingIndex].drivingBefore,
              timeline.finish.flagAt - timeline.stints[editingIndex].start,
              avgLapTime,
              avgFuelPerLap,
            )
            : null}
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
      {stints.length > 0 && (
        <DriverSummary
          stints={drivenStints}
          drivers={drivers}
          totalRaceTime={drivenEnd}
          strip={
              <RaceStrip
                timeline={timeline}
                stints={rows.map(row => ({ id: row.stint._id, order: row.order, driver: row.stint.driver }))}
                drivers={drivers}
                currentRaceTime={currentRaceTime}
                onSelectStint={scrollToStint}
              />
          }
        />
      )}
      <NotesEditor raceId={raceId} notes={notes} />
    </ScheduleContainer>
  )
}
