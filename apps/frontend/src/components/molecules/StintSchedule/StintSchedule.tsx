import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { type Stint } from 'types/Schedule'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { AddStintModal } from 'components/molecules/AddStintModal/AddStintModal'
import { EditStintModal } from 'components/molecules/EditStintModal/EditStintModal'
import { ConfirmModal } from 'components/molecules/ConfirmModal/ConfirmModal'
import { StintsApi } from 'api/StintsApi'
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
  CharCount
} from './StintSchedule.styles'
import EditIcon from 'assets/svg/edit.svg'
import TrashIcon from 'assets/svg/trash.svg'

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

function formatTime(minutes: number, startTime: string): string {
  const [hours, mins] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMins = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
}

function formatDuration(minutes: number): string {
  return `${minutes} min`
}

function getTiresAtIndex(stints: Stint[], index: number, tireSets: number): number {
  if (stints.length === 0) return tireSets
  
  let tires = tireSets
  for (let i = 0; i <= index; i++) {
    const stint = stints[i]
    if (stint) {
      const changedTires = [
        stint.tireFL !== '-' ? 1 : 0,
        stint.tireFR !== '-' ? 1 : 0,
        stint.tireRL !== '-' ? 1 : 0,
        stint.tireRR !== '-' ? 1 : 0
      ].reduce((sum, v) => sum + v, 0)
      tires = tires - changedTires
    }
  }
  return tires
}

interface StintScheduleProps {
  drivers: string[]
  avgStintTime: number
  avgLapTime: number
  raceId: string
  startTime: string
  tireSets: number
}

export function StintSchedule({ drivers, avgStintTime, avgLapTime, raceId, startTime, tireSets }: StintScheduleProps) {
  const { t } = useTranslation('raceDetails')
  const [stints, setStints] = useState<Stint[]>([])
  const [currentRaceTime, setCurrentRaceTime] = useState<number>(() => {
    const safeStartTime = startTime || '19:30'
    const [hours, minutes] = safeStartTime.split(':').map(Number)
    const now = new Date()
    const raceStart = new Date(now)
    raceStart.setHours(hours, minutes, 0, 0)
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
  const [notes, setNotes] = useState('')
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const MAX_CHARS = 200

  useEffect(() => {
    if (notesRef.current) {
      notesRef.current.style.height = 'auto'
      notesRef.current.style.height = notesRef.current.scrollHeight + 'px'
    }
  }, [notes])

  useEffect(() => {
    const loadStints = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/schedule/${raceId}`)
        const data = await res.json()
        if (data.stints) {
          setStints(data.stints)
        }
      } catch (err) {
        console.error('Failed to load stints', err)
      }
    }
    if (raceId) {
      loadStints()
    }
  }, [raceId])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const raceStart = new Date(now)
    raceStart.setHours(19, 30, 0, 0)
      setCurrentRaceTime(Math.max(0, Math.floor((now.getTime() - raceStart.getTime()) / 60000)))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

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
              const stintStartTime = stints.slice(0, index).reduce((sum, s) => sum + s.duration, 0)
              const stintEndTime = stintStartTime + stint.duration
              const isActive = isStintActive(stintStartTime, stint.duration)
              const displayTires = getTiresAtIndex(stints, index, tireSets)
              
              return (
                <>
                  <TableRow key={stint._id} $isActive={isActive}>
                    <StintNumberCell>{index + 1}</StintNumberCell>
                    <TableCell>{formatTime(stintStartTime, startTime)}</TableCell>
                    <TableCell>{formatDuration(stint.duration)}</TableCell>
                    <TableCell>{formatTime(stintEndTime, startTime)}</TableCell>
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
                  <TableRow key={`separator-${stint._id}`}>
                    <td colSpan={14} style={{ padding: 0, border: 'none' }}>
                      <RowSeparator 
                        $visible={hoveredSeparatorIndex === index + 1}
                        onMouseEnter={() => setHoveredSeparatorIndex(index + 1)}
                        onMouseLeave={() => setHoveredSeparatorIndex(null)}
                        onClick={() => {
                          setAddAfterStint(index + 1)
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
                </>
              )
            })}
          </TableBody>
        </Table>
      </TableWrapper>
      )}
      <AddStintModal 
        isOpen={addModalOpen}
        insertAfterStint={addAfterStint}
        totalStints={stints.length}
        raceId={raceId}
        drivers={drivers}
        avgStintTime={avgStintTime}
        avgLapTime={avgLapTime}
        previousFuelLaps={addAfterStint > 0 ? stints[addAfterStint - 1]?.fuelLaps ?? 0 : 0}
        previousTires={getTiresAtIndex(stints, addAfterStint, tireSets)}
        isFirstStint={stints.length === 0}
        tireSets={tireSets}
        onStintAdded={(newStint) => {
          setStints(prev => [...prev, newStint])
          setAddModalOpen(false)
        }}
        onCancel={() => setAddModalOpen(false)}
      />
      {editingStint && (
        <EditStintModal
          isOpen={editModalOpen}
          stint={editingStint}
          drivers={drivers}
          avgStintTime={avgStintTime}
          avgLapTime={avgLapTime}
          previousFuelLaps={editingStintIndex > 0 ? stints[editingStintIndex - 1].fuelLaps : 0}
          previousTires={getTiresAtIndex(stints, editingStintIndex, tireSets)}
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
          onChange={(e) => setNotes(e.target.value.slice(0, MAX_CHARS))}
          placeholder={t('notesPlaceholder')}
          rows={3}
        />
        <CharCount $isOver={notes.length >= MAX_CHARS}>
          {notes.length}/{MAX_CHARS}
        </CharCount>
      </NotesContainer>
    </ScheduleContainer>
  )
}
