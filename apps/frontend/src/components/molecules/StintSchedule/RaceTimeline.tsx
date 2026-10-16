import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { type RaceTimeline as Timeline, type TimelineStint, formatRaceTime } from 'utils/raceTimeline'
import { addMinutesToClock, formatHoursMinutes } from 'utils/time'
import { driverColor } from 'utils/drivers'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { StatItem, StatLabel } from './ScheduleCard.styles'
import {
  TimelineRow,
  TimelineLabel,
  Rail,
  RailDot,
  TimelineContent,
  CardSlot,
  HourMark,
  FinishCard,
  FinishTitle,
  FinishStats,
  FinishValue,
  FinishNote,
  StripContainer,
  StripTicks,
  Strip,
  StripHourLine,
  StripSegment,
  StripGap,
  StripNow,
  StripLegend,
  LegendItem,
  LegendSwatch
} from './RaceTimeline.styles'

const FlagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </svg>
)

interface TimelineItemProps {
  timelineStint: TimelineStint
  raceStartClock: string
  isActive: boolean
  isFirst: boolean
  card: ReactNode
  divider?: ReactNode
}

// One stint on the race rail: race time and lap at its start, hour marks along the card.
export function TimelineItem({ timelineStint, raceStartClock, isActive, isFirst, card, divider }: TimelineItemProps) {
  const { t } = useTranslation('raceDetails')
  const { start, startLap, hourMarks, status } = timelineStint
  const after = status === 'after'

  return (
    <TimelineRow>
      <TimelineLabel $tone={after ? 'danger' : 'default'}>
        {after ? t('afterFinish') : `T+${formatRaceTime(start)}`}
        <span>{t('lapN', { lap: startLap })}</span>
      </TimelineLabel>
      <Rail $first={isFirst}>
        <RailDot $state={after ? 'after' : isActive ? 'active' : 'default'} />
      </Rail>
      <TimelineContent $after={after} $spaced={!divider}>
        <CardSlot>
          {card}
          {hourMarks.map(mark => (
            <HourMark
              key={mark.hour}
              style={{ top: `max(${mark.offset * 100}%, 3.5rem)` }}
              title={t('hourMarkTitle', {
                hour: mark.hour,
                clock: addMinutesToClock(raceStartClock, mark.hour * 60),
                lap: mark.lap,
              })}
            >
              <span>{mark.hour} h</span>
            </HourMark>
          ))}
        </CardSlot>
        {divider}
      </TimelineContent>
    </TimelineRow>
  )
}

interface FinishItemProps {
  timeline: Timeline
  raceStartClock: string
  afterFinishOrders: number[]
  onAddStint: () => void
}

// Checkered flag under the last stint: when the time runs out and when the race ends.
export function FinishItem({ timeline, raceStartClock, afterFinishOrders, onAddStint }: FinishItemProps) {
  const { t } = useTranslation('raceDetails')
  const { finish, gap, coversRace } = timeline

  return (
    <TimelineRow>
      <TimelineLabel $tone="strong">
        T+{formatRaceTime(finish.timeUpAt)}
      </TimelineLabel>
      <Rail $last>
        <RailDot $state="finish" />
      </Rail>
      <FinishCard>
        <FinishTitle>
          <FlagIcon />
          {t('finish')}
        </FinishTitle>
        <FinishStats>
          <StatItem>
            <StatLabel>{t('timeUp')}</StatLabel>
            <FinishValue>
              {addMinutesToClock(raceStartClock, finish.timeUpAt)}
              <span>{t('lapInProgress', { lap: finish.timeUpLap })}</span>
            </FinishValue>
          </StatItem>
          <StatItem>
            <StatLabel>{t('checkeredFlag')}</StatLabel>
            <FinishValue>
              {addMinutesToClock(raceStartClock, finish.flagAt)}
              <span>{t('totalLaps', { lap: finish.totalLaps })}</span>
            </FinishValue>
          </StatItem>
          <StatItem>
            <StatLabel>{t('afterTime')}</StatLabel>
            <FinishValue>
              +{formatSeconds((finish.flagAt - finish.timeUpAt) * 60)}
              <span>{t('lastLap')}</span>
            </FinishValue>
          </StatItem>
        </FinishStats>
        {afterFinishOrders.length > 0 ? (
          <FinishNote $tone="danger">{t('afterFinishWarning', { count: afterFinishOrders.length, list: afterFinishOrders.join(', ') })}</FinishNote>
        ) : coversRace ? (
          <FinishNote $tone="success">{t('planCovered')}</FinishNote>
        ) : (
          <FinishNote $tone="warning">
            {t('planGap', { time: formatHoursMinutes(gap) })}
            <TextButton $size="sm" onClick={onAddStint}>{t('addStint')}</TextButton>
          </FinishNote>
        )}
      </FinishCard>
    </TimelineRow>
  )
}

const formatSeconds = (seconds: number) => {
  const total = Math.round(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

interface RaceStripProps {
  timeline: Timeline
  stints: { id: string; order: number; driver: string }[]
  drivers: string[]
  currentRaceTime: number
  onSelectStint: (id: string) => void
}

// The whole race on one bar: stints colored by driver, pit stops as gaps, the uncovered rest hatched.
export function RaceStrip({ timeline, stints, drivers, currentRaceTime, onSelectStint }: RaceStripProps) {
  const { t } = useTranslation('raceDetails')
  const scale = Math.max(timeline.finish.flagAt, 1)
  const pct = (minutes: number) => `${Math.min(100, Math.max(0, (minutes / scale) * 100))}%`
  const colorOf = (driver: string) => driverColor(drivers, driver)
  const hours = Array.from({ length: Math.floor(timeline.raceMinutes / 60) + 1 }, (_, hour) => hour)
  // Long races label every 2nd or 3rd hour (every other one of those on phones).
  const labelStep = hours.length <= 9 ? 1 : hours.length <= 13 ? 2 : 3
  // The flag falls within a lap of the full hour, so they share one label.
  const endsOnHour = timeline.raceMinutes > 0 && timeline.raceMinutes % 60 === 0
  const driven = timeline.stints
    .map((stint, i) => ({ ...stint, ...stints[i] }))
    .filter(stint => stint.status !== 'after')
  // Back-to-back stints of one driver form one segment, pit stops between them included.
  const segments: { id: string; driver: string; start: number; end: number; orders: number[] }[] = []
  driven.forEach(stint => {
    const previous = segments[segments.length - 1]
    if (previous && previous.driver === stint.driver) {
      previous.end = stint.end
      previous.orders.push(stint.order)
    } else {
      segments.push({ id: stint.id, driver: stint.driver, start: stint.start, end: stint.end, orders: [stint.order] })
    }
  })
  const isLive = currentRaceTime >= 0 && currentRaceTime < timeline.finish.flagAt

  return (
    <StripContainer>
      <StripTicks aria-hidden="true">
        {(endsOnHour ? hours.slice(0, -1) : hours)
          .filter(hour => hour % labelStep === 0)
          .map(hour => (
            <span key={hour} data-minor={hour % (labelStep * 2) !== 0 || undefined} style={{ left: pct(hour * 60) }}>
              {hour} h
            </span>
          ))}
        <span style={{ left: '100%' }} title={t('finish')}>
          <FlagIcon /> {endsOnHour ? `${hours[hours.length - 1]} h` : t('finish')}
        </span>
      </StripTicks>
      <Strip>
        {hours.slice(1).map(hour => <StripHourLine key={hour} style={{ left: pct(hour * 60) }} />)}
        {segments.map(segment => {
          const orders = segment.orders.length > 1
            ? `${segment.orders[0]}–${segment.orders[segment.orders.length - 1]}`
            : `${segment.orders[0]}`
          const label = `${segment.driver} · ${t('stintsN', { count: segment.orders.length, list: orders })} · T+${formatRaceTime(segment.start)}–${formatRaceTime(segment.end)}`
          return (
            <StripSegment
              key={segment.id}
              type="button"
              $bg={colorOf(segment.driver)}
              style={{ left: pct(segment.start), width: pct(segment.end - segment.start) }}
              title={label}
              aria-label={label}
              onClick={() => onSelectStint(segment.id)}
            />
          )
        })}
        {timeline.gap > 0 && (
          <StripGap style={{ left: pct(timeline.plannedEnd), width: pct(timeline.gap) }}>
            {formatHoursMinutes(timeline.gap)}
          </StripGap>
        )}
        {isLive && <StripNow style={{ left: pct(currentRaceTime) }} />}
      </Strip>
      <StripLegend>
        {isLive && (
          <LegendItem>
            <LegendSwatch $line $bg="var(--primary)" />
            {t('now')} · T+{formatRaceTime(currentRaceTime)}
          </LegendItem>
        )}
      </StripLegend>
    </StripContainer>
  )
}
