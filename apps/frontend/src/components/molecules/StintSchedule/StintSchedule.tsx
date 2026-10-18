import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { type Incident, type Stint } from 'types/Schedule'
import { type DriverAvailability } from 'types/Race'
import { availabilityLabel, availabilityWindows, driverBlocks, isAvailable } from 'utils/availability'
import { remainingTiresAt } from 'utils/tires'
import { stintStartLap } from 'utils/laps'
import { raceTimeline, formatRaceTime, maxNewStintDuration, maxStintDuration, finishFuel, newStintMinutesToFlag } from 'utils/raceTimeline'
import { clockAt, clockChanges, minutesSinceRaceStart, raceStartDateTime } from 'utils/raceClock'
import { calculatePitstopTime } from 'utils/pitstop'
import { durationToLap, incidentLapAt, incidentLapRange, retiredIndex } from 'utils/incidents'
import { REPAIR_PARTS, SUSPENSION_PARTS, calculateRepairTime } from 'utils/repairs'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useSocket } from '@/hooks/useSocket'
import { AddStintModal } from 'components/molecules/AddStintModal/AddStintModal'
import { EditStintModal } from 'components/molecules/EditStintModal/EditStintModal'
import { ConfirmModal } from 'components/molecules/ConfirmModal/ConfirmModal'
import { IncidentModal } from 'components/molecules/IncidentModal/IncidentModal'
import { StintsApi } from 'api/StintsApi'
import { ScheduleApi } from 'api/ScheduleApi'
import { ScheduleCard, TireMap } from './ScheduleCard'
import { CardList } from './ScheduleCard.styles'
import { InsertDivider } from './InsertDivider'
import { TimelineItem, FinishItem, IncidentItem, RaceStrip } from './RaceTimeline'
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
  pitLaneTime: number
  raceLength: number
  notes?: string
}

export function StintSchedule({ drivers, driverAvailability, avgStintTime, avgLapTime, avgFuelPerLap, raceId, startTime, raceDate, eventStartTime, tireSets, fuelTankCapacity, pitLaneTime, raceLength, notes }: StintScheduleProps) {
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
  const [incidentIndex, setIncidentIndex] = useState<number | null>(null)
  const [deletingIncident, setDeletingIncident] = useState<Stint | null>(null)

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

  const raceStart = raceStartDateTime(raceDate, eventStartTime, startTime)
  const currentRaceTime = minutesSinceRaceStart(raceStart, now)
  const timeline = raceTimeline(stints, raceLength, avgLapTime, fuelTankCapacity, pitLaneTime)
  // Summer/winter time changes before the flag; race minutes stay real time, clocks jump.
  const changes = clockChanges(raceStart, timeline.finish.flagAt)
  const editingStint = editingIndex !== null ? stints[editingIndex] : null
  // A written-off car ends the race: later stints are never driven.
  const retiredAt = retiredIndex(stints)

  const openAddModal = (afterOrder: number) => {
    setAddAfterStint(afterOrder)
    setAddModalOpen(true)
  }

  const rows = stints.map((stint, index) => {
    const timelineStint = timeline.stints[index]
    const { start, end } = timelineStint
    const toFlag = timelineStint.status === 'finish'
    const retired = retiredAt >= 0 && index > retiredAt
    const driven = timelineStint.status !== 'after' && !retired
    const availability = driverBlocks(driverAvailability, stint.driver)
    const unavailable = stint.driver && driven
      && !isAvailable(availabilityWindows(availability, raceDate, eventStartTime, startTime), start, end)
    // A change in the pit stop after the stint shows on the stint, like the hour marks.
    const nextStart = index + 1 < stints.length ? timeline.stints[index + 1].start : end
    const change = driven
      ? changes.find(({ minute }) => minute >= start && minute < Math.max(end, nextStart))
      : undefined
    // The first stint starts from the grid, so it has no pit stop to repair at.
    const repairs = index > 0 ? REPAIR_PARTS.filter(part => stint.repairs?.includes(part)) : []
    const repair = repairs.length > 0
      ? {
        label: t('repairNote', { seconds: Math.round(calculateRepairTime(repairs)) }),
        details: repairs.map(part => (SUSPENSION_PARTS as readonly string[]).includes(part)
          ? `${t('suspension')} – ${t(`repairPart.${part}`).toLowerCase()}`
          : t(`repairPart.${part}`)).join(', '),
      }
      : undefined
    return {
      stint,
      index,
      repair,
      timelineStint,
      retired,
      driven,
      order: stint.order ?? index + 1,
      startClock: clockAt(raceStart, start),
      endClock: clockAt(raceStart, end),
      clockChange: change && t('clockChange', { from: change.from, to: change.to, time: formatRaceTime(change.minute) }),
      duration: toFlag ? `${Math.round(end - start)} min · ${t('toFlag')}` : `${stint.duration} min`,
      isActive: !retired && currentRaceTime >= start && currentRaceTime < end,
      remainingTires: remainingTiresAt(stints, index, tireSets),
      driverWarning: unavailable
        ? t('driverUnavailable', { window: availabilityLabel(availability, eventStartTime, t) ?? '' })
        : undefined,
    }
  })
  const lastOrder = rows.length ? rows[rows.length - 1].order : 0
  // No new stints once the plan reaches the checkered flag or the car is written off.
  const canInsert = !timeline.coversRace && retiredAt < 0
  const afterFinishOrders = rows.filter(row => row.timelineStint.status === 'after' && !row.retired).map(row => row.order)
  // As driven: the finishing stint is cut at the flag and stints after the finish (or
  // after the car was written off) don't count.
  const drivenStints = rows
    .filter(row => row.driven)
    .map(row => ({ driver: row.stint.driver, duration: row.timelineStint.end - row.timelineStint.start }))
  const drivenEnd = Math.max(0, ...rows.filter(row => row.driven).map(row => row.timelineStint.end))
  const retiredStint = retiredAt >= 0 ? stints[retiredAt] : null
  // The strip shows nothing driven after the car was written off.
  const stripTimeline = retiredAt >= 0
    ? { ...timeline, gap: 0, stints: timeline.stints.map((stint, i) => i > retiredAt ? { ...stint, status: 'after' as const } : stint) }
    : timeline
  const incidentStint = incidentIndex !== null ? stints[incidentIndex] : null
  const incidentTimelineStint = incidentIndex !== null ? timeline.stints[incidentIndex] : null
  const scrollToStint = (id: string) =>
    document.getElementById(`stint-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  // Where a stint added after `afterOrder` would start (race minutes), after a pit stop
  // with a driver change and a full tank.
  const newStintStart = (afterOrder: number) => {
    const previous = stints[afterOrder - 1]
    if (!previous) return 0
    const pitSeconds = calculatePitstopTime(previous, { ...previous, driver: `${previous.driver}-next`, fuel: 100, repairs: [] }, fuelTankCapacity, pitLaneTime)
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
                raceStart={raceStart}
                isActive={row.isActive}
                isFirst={i === 0}
                retired={row.retired}
                card={
              <ScheduleCard
                badge={row.order}
                start={row.startClock}
                end={row.endClock}
                duration={row.duration}
                clockChange={row.clockChange}
                repair={row.repair}
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
                        fl={row.stint.tireFL}
                        fr={row.stint.tireFR}
                        rl={row.stint.tireRL}
                        rr={row.stint.tireRR}
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
                incident={row.stint.incident && (
                  <IncidentItem
                    incident={row.stint.incident}
                    clock={row.endClock}
                    onDelete={() => setDeletingIncident(row.stint)}
                  />
                )}
                divider={row.driven && (canInsert || !row.stint.incident) && (
                  <InsertDivider
                    after={row.order}
                    onInsert={canInsert ? () => openAddModal(row.order) : undefined}
                    // One incident per stint: it ends there.
                    onIncident={row.stint.incident ? undefined : () => setIncidentIndex(row.index)}
                    pinned={row.isActive}
                  />
                )}
              />
            </div>
          ))}
          <FinishItem
            timeline={timeline}
            raceStart={raceStart}
            afterFinishOrders={afterFinishOrders}
            retirement={retiredStint?.incident ? { order: retiredStint.order, lap: retiredStint.incident.lap } : undefined}
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
        eventDate={raceDate}
        eventStartClock={eventStartTime}
        raceStartClock={startTime}
        stintStart={newStintStart(addAfterStint)}
        flagAt={timeline.finish.flagAt}
        avgStintTime={avgStintTime}
        startLap={startLapBefore(addAfterStint)}
        maxDuration={maxNewStintDuration(timeline, stints[addAfterStint - 1] ?? null, fuelTankCapacity, pitLaneTime)}
        finishFuel={addAfterStint === stints.length && !timeline.coversRace
          ? finishFuel(
            timeline,
            timeline.totalDriving,
            newStintMinutesToFlag(timeline, stints[stints.length - 1] ?? null, fuelTankCapacity, pitLaneTime),
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
          eventDate={raceDate}
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
      {incidentStint && incidentTimelineStint && incidentIndex !== null && (
        <IncidentModal
          key={`incident-${incidentStint._id}`}
          stintOrder={incidentStint.order}
          lapRange={incidentLapRange(incidentTimelineStint, avgLapTime)}
          suggestedLap={incidentLapAt(incidentTimelineStint, currentRaceTime, avgLapTime)}
          durationForLap={(lap) => durationToLap(incidentTimelineStint.drivingBefore, lap, avgLapTime)}
          hasNextStint={incidentIndex < stints.length - 1}
          onConfirm={async (incident: Incident) => {
            try {
              // Cut the stint to the incident's lap; the rest of the plan moves up.
              const updated = await StintsApi.update(incidentStint._id, {
                duration: durationToLap(incidentTimelineStint.drivingBefore, incident.lap, avgLapTime),
                durationAuto: false,
                incident,
              })
              setStints(prev => prev.map(s => s._id === incidentStint._id ? updated : s))
              setIncidentIndex(null)
              // Then decide what changes in the next stint (or plan one, after the last).
              if (incident.type !== 'totalDamage') {
                if (incidentIndex < stints.length - 1) setEditingIndex(incidentIndex + 1)
                else openAddModal(incidentStint.order)
              }
            } catch (err) {
              console.error('Failed to save incident', err)
              showError(t('save-failed', { ns: 'common' }))
            }
          }}
          onCancel={() => setIncidentIndex(null)}
        />
      )}
      <ConfirmModal
        isOpen={deletingIncident !== null}
        title={t('deleteIncident')}
        message={t('confirmDeleteIncident')}
        onConfirm={async () => {
          if (!deletingIncident) return
          try {
            const updated = await StintsApi.update(deletingIncident._id, { incident: null })
            setStints(prev => prev.map(s => s._id === deletingIncident._id ? updated : s))
            setDeletingIncident(null)
          } catch (err) {
            console.error('Failed to delete incident', err)
            showError(t('delete-failed', { ns: 'common' }))
          }
        }}
        onCancel={() => setDeletingIncident(null)}
      />
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
                timeline={stripTimeline}
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
