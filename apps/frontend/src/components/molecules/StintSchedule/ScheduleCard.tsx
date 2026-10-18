import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NO_SPOTTER } from 'utils/crew'
import { compoundOf } from 'utils/tires'
import { ActiveIndicator, MutedValue } from './StintSchedule.styles'
import {
  Card,
  CardBadge,
  CardTime,
  TimeRange,
  Duration,
  ClockChangeNote,
  RepairNote,
  CardActions,
  People,
  DriverName,
  Spotter,
  DriverWarning,
  Stats,
  StatItem,
  StatLabel,
  StatValue,
  TireGrid,
  Tire
} from './ScheduleCard.styles'

interface ScheduleCardProps {
  badge?: ReactNode
  start: string
  end: string
  duration: ReactNode
  // Shown under the duration when the clocks change during the stint (or the pit stop after it).
  clockChange?: string
  // Repairs at the pit stop before the stint: the time they add, and the parts for its tooltip.
  repair?: { label: string; details: string }
  isActive?: boolean
  driver?: string
  // Shown under the driver, e.g. when they are not available at this time.
  driverWarning?: string
  // The stint's pace when it is not the race's, e.g. "1:35:000 · 4.5%".
  pace?: string
  spotter?: string
  stats?: { label: string; value: ReactNode }[]
  actions: ReactNode
}

// Phone version of one table row: time range first, then who drives, then the numbers.
export function ScheduleCard({ badge, start, end, duration, clockChange, repair, isActive = false, driver, driverWarning, pace, spotter, stats, actions }: ScheduleCardProps) {
  const { t } = useTranslation('raceDetails')

  return (
    <Card $isActive={isActive} $hasBadge={badge !== undefined} aria-current={isActive || undefined}>
      {badge !== undefined && <CardBadge>{badge}</CardBadge>}
      <CardTime>
        <TimeRange>{start} – {end}</TimeRange>
        <Duration>
          {duration}
          {repair && (
            <RepairNote role="note" title={repair.details} aria-label={`${t('repairs')} ${repair.label}: ${repair.details}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              {repair.label}
            </RepairNote>
          )}
        </Duration>
        {clockChange && <ClockChangeNote role="note">{clockChange}</ClockChangeNote>}
      </CardTime>
      {driver !== undefined && (
        <People>
          <DriverName>
            {driver || <MutedValue>–</MutedValue>}
            {isActive && <ActiveIndicator />}
          </DriverName>
          <Spotter>{t('spotter')}: {spotter === NO_SPOTTER ? t('noSpotter') : spotter || '–'}</Spotter>
          {pace && <Spotter>{pace}</Spotter>}
          {driverWarning && <DriverWarning role="status">{driverWarning}</DriverWarning>}
        </People>
      )}
      {stats && (
        <Stats>
          {stats.map(({ label, value }) => (
            <StatItem key={label}>
              <StatLabel>{label}</StatLabel>
              <StatValue>{value}</StatValue>
            </StatItem>
          ))}
        </Stats>
      )}
      <CardActions>{actions}</CardActions>
    </Card>
  )
}

interface TireMapProps {
  // Each wheel's field: '-' when it stays on, otherwise the compound fitted.
  fl: string
  fr: string
  rl: string
  rr: string
}

export function TireMap({ fl, fr, rl, rr }: TireMapProps) {
  const { t } = useTranslation('raceDetails')
  const changed = ([['FL', fl], ['FR', fr], ['RL', rl], ['RR', rr]] as const)
    .filter(([, tire]) => tire !== '-')
    .map(([name, tire]) => `${name} ${t(`tireCompound.${compoundOf(tire)}`)}`)
  const label = changed.length ? changed.join(', ') : '–'

  return (
    <TireGrid role="img" aria-label={label} title={label}>
      <Tire $tire={fl} />
      <Tire $tire={fr} />
      <Tire $tire={rl} />
      <Tire $tire={rr} />
    </TireGrid>
  )
}
