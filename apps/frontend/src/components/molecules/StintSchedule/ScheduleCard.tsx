import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NO_SPOTTER } from 'utils/crew'
import { ActiveIndicator, MutedValue } from './StintSchedule.styles'
import {
  Card,
  CardBadge,
  CardTime,
  TimeRange,
  Duration,
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
  isActive?: boolean
  driver?: string
  // Shown under the driver, e.g. when they are not available at this time.
  driverWarning?: string
  spotter?: string
  stats?: { label: string; value: ReactNode }[]
  actions: ReactNode
}

// Phone version of one table row: time range first, then who drives, then the numbers.
export function ScheduleCard({ badge, start, end, duration, isActive = false, driver, driverWarning, spotter, stats, actions }: ScheduleCardProps) {
  const { t } = useTranslation('raceDetails')

  return (
    <Card $isActive={isActive} $hasBadge={badge !== undefined} aria-current={isActive || undefined}>
      {badge !== undefined && <CardBadge>{badge}</CardBadge>}
      <CardTime>
        <TimeRange>{start} – {end}</TimeRange>
        <Duration>{duration}</Duration>
      </CardTime>
      {driver !== undefined && (
        <People>
          <DriverName>
            {driver || <MutedValue>–</MutedValue>}
            {isActive && <ActiveIndicator />}
          </DriverName>
          <Spotter>{t('spotter')}: {spotter === NO_SPOTTER ? t('noSpotter') : spotter || '–'}</Spotter>
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
  fl: boolean
  fr: boolean
  rl: boolean
  rr: boolean
}

export function TireMap({ fl, fr, rl, rr }: TireMapProps) {
  const changed = ([['FL', fl], ['FR', fr], ['RL', rl], ['RR', rr]] as const)
    .filter(([, isChanged]) => isChanged)
    .map(([name]) => name)
  const label = changed.length ? changed.join(', ') : '–'

  return (
    <TireGrid role="img" aria-label={label} title={label}>
      <Tire $changed={fl} />
      <Tire $changed={fr} />
      <Tire $changed={rl} />
      <Tire $changed={rr} />
    </TireGrid>
  )
}
