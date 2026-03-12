import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { type Stint } from 'types/Schedule'
import { IconButton } from 'components/atoms/IconButton/IconButton'
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
  AddButtonWrapper,
  RowSeparator,
  AddButton
} from './StintSchedule.styles'
import EditIcon from 'assets/svg/edit.svg'
import TrashIcon from 'assets/svg/trash.svg'

const mockStints: Stint[] = [
  {
    _id: '1',
    scheduleId: 'sch1',
    startTime: 0,
    duration: 45,
    driver: 'Max Verstappen',
    fuelLaps: 22,
    tires: 'Soft',
    lockedBy: 'team'
  },
  {
    _id: '2',
    scheduleId: 'sch1',
    startTime: 45,
    duration: 42,
    driver: 'Sergio Perez',
    fuelLaps: 38,
    tires: 'Medium'
  },
  {
    _id: '3',
    scheduleId: 'sch1',
    startTime: 87,
    duration: 48,
    driver: 'Max Verstappen',
    fuelLaps: 63,
    tires: 'Hard'
  },
  {
    _id: '4',
    scheduleId: 'sch1',
    startTime: 135,
    duration: 40,
    driver: 'Sergio Perez',
    fuelLaps: 79,
    tires: 'Soft'
  },
  {
    _id: '5',
    scheduleId: 'sch1',
    startTime: 175,
    duration: 35,
    driver: 'Max Verstappen',
    fuelLaps: 98,
    tires: 'Medium'
  },
  {
    _id: '6',
    scheduleId: 'sch1',
    startTime: 210,
    duration: 44,
    driver: 'Sergio Perez',
    fuelLaps: 118,
    tires: 'Hard'
  },
  {
    _id: '7',
    scheduleId: 'sch1',
    startTime: 254,
    duration: 39,
    driver: 'Max Verstappen',
    fuelLaps: 137,
    tires: 'Soft'
  },
  {
    _id: '8',
    scheduleId: 'sch1',
    startTime: 293,
    duration: 41,
    driver: 'Sergio Perez',
    fuelLaps: 156,
    tires: 'Medium'
  },
  {
    _id: '9',
    scheduleId: 'sch1',
    startTime: 334,
    duration: 46,
    driver: 'Max Verstappen',
    fuelLaps: 178,
    tires: 'Hard'
  },
  {
    _id: '10',
    scheduleId: 'sch1',
    startTime: 380,
    duration: 38,
    driver: 'Sergio Perez',
    fuelLaps: 195,
    tires: 'Soft'
  },
  {
    _id: '11',
    scheduleId: 'sch1',
    startTime: 418,
    duration: 43,
    driver: 'Max Verstappen',
    fuelLaps: 215,
    tires: 'Medium'
  },
  {
    _id: '12',
    scheduleId: 'sch1',
    startTime: 461,
    duration: 37,
    driver: 'Sergio Perez',
    fuelLaps: 234,
    tires: 'Hard'
  },
  {
    _id: '13',
    scheduleId: 'sch1',
    startTime: 498,
    duration: 45,
    driver: 'Max Verstappen',
    fuelLaps: 258,
    tires: 'Soft'
  },
  {
    _id: '14',
    scheduleId: 'sch1',
    startTime: 543,
    duration: 40,
    driver: 'Sergio Perez',
    fuelLaps: 276,
    tires: 'Medium'
  },
  {
    _id: '15',
    scheduleId: 'sch1',
    startTime: 583,
    duration: 42,
    driver: 'Max Verstappen',
    fuelLaps: 298,
    tires: 'Hard'
  }
]

const RACE_START_HOUR = 17
const RACE_START_MINUTE = 30

function formatTime(minutes: number): string {
  const totalMinutes = RACE_START_HOUR * 60 + RACE_START_MINUTE + minutes
  const hours = Math.floor(totalMinutes / 60) % 24
  const mins = totalMinutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function formatDuration(minutes: number): string {
  return `${minutes} min`
}

export function StintSchedule() {
  const { t } = useTranslation('raceDetails')
  const [currentRaceTime, setCurrentRaceTime] = useState<number>(() => {
    const now = new Date()
    const raceStart = new Date(now)
    raceStart.setHours(17, 30, 0, 0)
    return Math.max(0, Math.floor((now.getTime() - raceStart.getTime()) / 60000))
  })
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [hoveredAddButton, setHoveredAddButton] = useState<number | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const raceStart = new Date(now)
      raceStart.setHours(17, 30, 0, 0)
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
              <TableHeader>{t('tires')}</TableHeader>
              <TableHeader></TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {mockStints.map((stint, index) => {
              const endTime = stint.startTime + stint.duration
              const isActive = isStintActive(stint.startTime, stint.duration)
              return (
                <>
                  <TableRow 
                    key={stint._id} 
                    $isActive={isActive}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <StintNumberCell>{index + 1}</StintNumberCell>
                    <TableCell>{formatTime(stint.startTime)}</TableCell>
                    <TableCell>{formatDuration(stint.duration)}</TableCell>
                    <TableCell>{formatTime(endTime)}</TableCell>
                    <TableCell>{stint.fuelLaps}</TableCell>
                    <DriverCell>
                      {stint.driver}
                      {isActive && <ActiveIndicator />}
                    </DriverCell>
                    <TableCell>{stint.tires}</TableCell>
                    <ActionsCell>
                      <ActionButtonsWrapper>
                        <IconButton onClick={() => console.log('Edit', stint._id)} title={t('edit')} icon={EditIcon} />
                        <IconButton onClick={() => console.log('Delete', stint._id)} title={t('delete')} icon={TrashIcon} />
                      </ActionButtonsWrapper>
                    </ActionsCell>
                  </TableRow>
                  <TableRow key={`separator-${stint._id}`}>
                    <ActionsCell colSpan={8} style={{ padding: 0, border: 'none', height: 0 }}>
                      <RowSeparator $visible={hoveredAddButton === index}>
                        <AddButtonWrapper 
                          $visible={hoveredRow === index}
                          onMouseEnter={() => setHoveredAddButton(index)}
                          onMouseLeave={() => setHoveredAddButton(null)}
                        >
                          <AddButton onClick={() => console.log('Add after', index + 1)} title={t('add')}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          </AddButton>
                        </AddButtonWrapper>
                      </RowSeparator>
                    </ActionsCell>
                  </TableRow>
                </>
              )
            })}
          </TableBody>
        </Table>
      </TableWrapper>
    </ScheduleContainer>
  )
}
