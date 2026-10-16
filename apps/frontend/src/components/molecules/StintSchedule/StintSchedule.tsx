import { Fragment, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { type Stint } from 'types/Schedule'
import { calculatePitstopTime } from 'utils/pitstop'
import { addMinutesToClock, formatHoursMinutes } from 'utils/time'
import { remainingTiresAt } from 'utils/tires'
import { CheckIcon } from 'components/atoms/CheckIcon/CheckIcon'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useSocket } from '@/hooks/useSocket'
import { AddStintModal } from 'components/molecules/AddStintModal/AddStintModal'
import { EditStintModal } from 'components/molecules/EditStintModal/EditStintModal'
import { ConfirmModal } from 'components/molecules/ConfirmModal/ConfirmModal'
import { StintsApi } from 'api/StintsApi'
import { ScheduleApi } from 'api/ScheduleApi'
import { RacesApi } from 'api/RacesApi'
import {
  ScheduleContainer,
  ScheduleTitle,
  TableWrapper,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  StintNumberCell,
  DriverCell,
  TableCell,
  ActiveIndicator,
  ActionsCell,
  ActionButtonsWrapper,
  RowSeparator,
  AddIcon,
  NotesContainer,
  NotesLabel,
  NotesTextarea,
  CharCount,
  NotesFooter,
  SaveNotesButton,
  DriverSummaryContainer,
  DriverSummaryTitle,
  DriverSummaryTable,
  DriverSummaryHead,
  DriverSummaryHeader,
  DriverSummaryBody,
  DriverSummaryRow,
  DriverNameCell,
  TotalTimeCell
} from './StintSchedule.styles'
import EditIcon from 'assets/svg/edit.svg'
import TrashIcon from 'assets/svg/trash.svg'

function formatDuration(minutes: number): string {
  return `${minutes} min`
}

interface StintScheduleProps {
  drivers: string[]
  avgStintTime: number
  avgLapTime: number
  raceId: string
  startTime: string
  tireSets: number
  fuelTankCapacity: number
  notes?: string
}

export function StintSchedule({ drivers, avgStintTime, avgLapTime, raceId, startTime, tireSets, fuelTankCapacity, notes: initialNotes }: StintScheduleProps) {
  const { t } = useTranslation('raceDetails')
  const { onStintRefresh } = useSocket()
  const [stints, setStints] = useState<Stint[]>([])
  const getRaceStartDate = (startTime: string): Date => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const now = new Date()
    const raceStart = new Date(now)
    raceStart.setHours(hours, minutes, 0, 0)
    if (raceStart > now) {
      raceStart.setDate(raceStart.getDate() - 1)
    }
    return raceStart
  }

  const [currentRaceTime, setCurrentRaceTime] = useState<number>(() => {
    const safeStartTime = startTime || '19:30'
    const raceStart = getRaceStartDate(safeStartTime)
    const now = new Date()
    return Math.max(0, Math.floor((now.getTime() - raceStart.getTime()) / 60000))
  })
  const [hoveredSeparatorIndex, setHoveredSeparatorIndex] = useState<number | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingStint, setEditingStint] = useState<Stint | null>(null)
  const [editingStintIndex, setEditingStintIndex] = useState(0)
  const [addAfterStint, setAddAfterStint] = useState(0)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingStint, setDeletingStint] = useState<Stint | null>(null)
  const [notes, setNotes] = useState(initialNotes || '')
  const [notesModified, setNotesModified] = useState(false)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const MAX_CHARS = 200

  // Sync notes when another client saves them (adjusting state during render).
  const [prevInitialNotes, setPrevInitialNotes] = useState(initialNotes)
  if (initialNotes !== prevInitialNotes) {
    setPrevInitialNotes(initialNotes)
    setNotes(initialNotes || '')
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    setNotesModified(value !== (initialNotes || ''))
  }

  const handleSaveNotes = async () => {
    try {
      await RacesApi.update(raceId, { notes })
      setNotesModified(false)
    } catch (err) {
      console.error('Failed to save notes', err)
    }
  }

  useEffect(() => {
    const loadStints = async () => {
      try {
        const data = await ScheduleApi.getByRaceId(raceId)
        setStints(data.stints)
      } catch (err) {
        console.error('Failed to load stints', err)
      }
    }
    if (raceId) {
      loadStints()
    }
  }, [raceId])

  useEffect(() => {
    const unsubscribe = onStintRefresh((data) => {
      if (data.raceId === raceId) {
        ScheduleApi.getByRaceId(raceId)
          .then(data => setStints(data.stints))
          .catch(err => console.error('Failed to refresh stints', err))
      }
    })

    return unsubscribe
  }, [raceId, onStintRefresh])

  useEffect(() => {
    const interval = setInterval(() => {
      const safeStartTime = startTime || '19:30'
      const raceStart = getRaceStartDate(safeStartTime)
      const now = new Date()
      setCurrentRaceTime(Math.max(0, Math.floor((now.getTime() - raceStart.getTime()) / 60000)))
    }, 60000)
    return () => clearInterval(interval)
  }, [startTime])

  const isStintActive = (startTime: number, duration: number): boolean => {
    return currentRaceTime >= startTime && currentRaceTime < startTime + duration
  }

  return (
    <ScheduleContainer>
      <ScheduleTitle>{t('stintSchedule')}</ScheduleTitle>
      {stints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>{t('noStints')}</p>
          <TextButton onClick={() => {
            setAddAfterStint(0)
            setAddModalOpen(true)
          }}>
            {t('addFirstStint')}
          </TextButton>
        </div>
      ) : (
        <TableWrapper>
        <Table>
          <TableHead>
            <tr>
              <TableHeader>#</TableHeader>
              <TableHeader>{t('startTime')}</TableHeader>
              <TableHeader>{t('duration')}</TableHeader>
              <TableHeader>{t('endTime')}</TableHeader>
              <TableHeader>{t('pitstopLap')}</TableHeader>
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
            {stints.map((stint, index) => {
              let stintStartTime = 0
              for (let i = 0; i < index; i++) {
                stintStartTime += stints[i].duration
                if (i < stints.length - 1) {
                  stintStartTime += calculatePitstopTime(stints[i], stints[i + 1], fuelTankCapacity) / 60
                }
              }
              const stintEndTime = stintStartTime + stint.duration
              const isActive = isStintActive(stintStartTime, stint.duration)
              const displayTires = remainingTiresAt(stints, index, tireSets)
              const stintNumber = stint.order !== undefined ? stint.order : index + 1
              
              return (
                <Fragment key={stint._id}>
                  <TableRow $isActive={isActive}>
                    <StintNumberCell>{stintNumber}</StintNumberCell>
                    <TableCell>{addMinutesToClock(startTime, stintStartTime)}</TableCell>
                    <TableCell>{formatDuration(stint.duration)}</TableCell>
                    <TableCell>{addMinutesToClock(startTime, stintEndTime)}</TableCell>
                    <TableCell>{stint.fuelLaps}</TableCell>
                    <DriverCell>
                      {stint.driver}
                      {isActive && <ActiveIndicator />}
                    </DriverCell>
                    <TableCell>{stint.spotter}</TableCell>
                    <TableCell>{stint.fuel}%</TableCell>
                    <TableCell>{stint.tireFL !== '-' ? <CheckIcon /> : stint.tireFL}</TableCell>
                    <TableCell>{stint.tireFR !== '-' ? <CheckIcon /> : stint.tireFR}</TableCell>
                    <TableCell>{stint.tireRL !== '-' ? <CheckIcon /> : stint.tireRL}</TableCell>
                    <TableCell>{stint.tireRR !== '-' ? <CheckIcon /> : stint.tireRR}</TableCell>
                    <TableCell>{displayTires}</TableCell>
                    <ActionsCell>
                      <ActionButtonsWrapper>
                        <IconButton onClick={() => {
                          setEditingStint(stint)
                          setEditingStintIndex(index)
                          setEditModalOpen(true)
                        }} title={t('edit')} icon={EditIcon} />
                        <IconButton onClick={() => {
                          setDeletingStint(stint)
                          setDeleteModalOpen(true)
                        }} title={t('delete')} icon={TrashIcon} />
                      </ActionButtonsWrapper>
                    </ActionsCell>
                  </TableRow>
                  <TableRow>
                    <td colSpan={14} style={{ padding: 0, border: 'none' }}>
                      <RowSeparator 
                        $visible={hoveredSeparatorIndex === index + 1}
                        onMouseEnter={() => setHoveredSeparatorIndex(index + 1)}
                        onMouseLeave={() => setHoveredSeparatorIndex(null)}
                        onClick={() => {
                          const insertAfterOrder = stint.order !== undefined ? stint.order : index + 1
                          setAddAfterStint(insertAfterOrder)
                          setAddModalOpen(true)
                        }}
                      >
                        <AddIcon $visible={hoveredSeparatorIndex === index + 1}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </AddIcon>
                      </RowSeparator>
                    </td>
                  </TableRow>
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </TableWrapper>
      )}
      <AddStintModal
        key={addModalOpen ? `open-${addAfterStint}` : 'closed'}
        isOpen={addModalOpen}
        insertAfterStint={addAfterStint}
        totalStints={stints.length}
        raceId={raceId}
        drivers={drivers}
        avgStintTime={avgStintTime}
        avgLapTime={avgLapTime}
        previousFuelLaps={addAfterStint > 0 ? stints[addAfterStint - 1]?.fuelLaps ?? 0 : 0}
        previousTires={addAfterStint > 0 ? remainingTiresAt(stints, addAfterStint - 1, tireSets) : tireSets}
        isFirstStint={addAfterStint === 0}
        tireSets={tireSets}
        allStints={stints}
        onStintAdded={() => {
          setAddModalOpen(false)
        }}
        onCancel={() => setAddModalOpen(false)}
      />
      {editingStint && (
        <EditStintModal
          key={editModalOpen ? `open-${editingStint._id}` : 'closed'}
          isOpen={editModalOpen}
          stint={editingStint}
          drivers={drivers}
          avgStintTime={avgStintTime}
          avgLapTime={avgLapTime}
          previousFuelLaps={editingStintIndex > 0 ? stints[editingStintIndex - 1].fuelLaps : 0}
          previousTires={remainingTiresAt(stints, editingStintIndex, tireSets)}
          isFirstStint={editingStintIndex === 0}
          tireSets={tireSets}
          onConfirm={async (updatedStint) => {
            try {
              const updated = await StintsApi.update(editingStint._id, updatedStint)
              setStints(prev => prev.map(s => s._id === editingStint._id ? updated : s))
              setEditModalOpen(false)
              setEditingStint(null)
            } catch (err) {
              console.error('Failed to update stint', err)
            }
          }}
          onCancel={() => {
            setEditModalOpen(false)
            setEditingStint(null)
          }}
        />
      )}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title={t('deleteStint')}
        message={t('confirmDeleteStint')}
        onConfirm={async () => {
          if (!deletingStint) return
          try {
            await StintsApi.delete(deletingStint._id)
            setStints(prev => prev.filter(s => s._id !== deletingStint._id))
            setDeleteModalOpen(false)
            setDeletingStint(null)
          } catch (err) {
            console.error('Failed to delete stint', err)
          }
        }}
        onCancel={() => {
          setDeleteModalOpen(false)
          setDeletingStint(null)
        }}
      />
      <NotesContainer>
        <NotesLabel>{t('notes')}</NotesLabel>
        <NotesTextarea 
          ref={notesRef}
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value.slice(0, MAX_CHARS))}
          placeholder={t('notesPlaceholder')}
          rows={3}
        />
        <NotesFooter>
          <CharCount $isOver={notes.length >= MAX_CHARS}>
            {notes.length}/{MAX_CHARS}
          </CharCount>
          {notesModified && (
            <SaveNotesButton onClick={handleSaveNotes}>
              {t('saveNotes')}
            </SaveNotesButton>
          )}
        </NotesFooter>
      </NotesContainer>
      {stints.length > 0 && drivers.length > 0 && (
        <DriverSummaryContainer>
          <DriverSummaryTitle>{t('driverTotalTime')}</DriverSummaryTitle>
          <DriverSummaryTable>
            <DriverSummaryHead>
              <tr>
                <DriverSummaryHeader>{t('driver')}</DriverSummaryHeader>
                <DriverSummaryHeader>{t('totalTime')}</DriverSummaryHeader>
              </tr>
            </DriverSummaryHead>
            <DriverSummaryBody>
              {Object.entries(
                stints.reduce((acc, stint) => {
                  if (stint.driver) {
                    acc[stint.driver] = (acc[stint.driver] || 0) + stint.duration
                  }
                  return acc
                }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .map(([driver, totalMinutes]) => (
                  <DriverSummaryRow key={driver}>
                    <DriverNameCell>{driver}</DriverNameCell>
                    <TotalTimeCell>{formatHoursMinutes(totalMinutes)}</TotalTimeCell>
                  </DriverSummaryRow>
                ))}
            </DriverSummaryBody>
          </DriverSummaryTable>
        </DriverSummaryContainer>
      )}
    </ScheduleContainer>
  )
}
