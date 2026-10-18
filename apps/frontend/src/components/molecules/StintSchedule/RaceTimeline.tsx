import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { type RaceTimeline as Timeline, type PenaltyMark, type TimelineStint, formatRaceTime } from 'utils/raceTimeline'
import { PENALTY_SHORT, formatPenaltyTime } from 'utils/penalties'
import { formatHoursMinutes } from 'utils/time'
import { clockAt } from 'utils/raceClock'
import { driverColor } from 'utils/drivers'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import { IncidentIcon, PenaltyIcon } from 'components/atoms/IncidentIcon/IncidentIcon'
import { INCIDENT_COLORS, incidentSoft } from 'components/atoms/IncidentIcon/incidentColors'
import { type Incident } from 'types/Schedule'
import TrashIcon from 'assets/svg/trash.svg'
import { StatItem, StatLabel } from './ScheduleCard.styles'
import {
  TimelineRow,
  TimelineLabel,
  Rail,
  RailDot,
  TimelineContent,
  CardSlot,
  HourMark,
  PenaltyRailMark,
  PenaltyList,
  PenaltyRow,
  PenaltyShort,
  PenaltyText,
  IncidentTile,
  IncidentText,
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
  StripPenalty,
  StripLegend,
  LegendItem,
  LegendSwatch
} from './RaceTimeline.styles'

const FlagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </svg>
)

// Share of the card height within which a penalty mark would cover an hour mark.
const PENALTY_MARK_GAP = 0.12

interface TimelineItemProps {
  timelineStint: TimelineStint
  // Moment of the race start: clocks are read at real moments (summer/winter time).
  raceStart: Date
  isActive: boolean
  isFirst: boolean
  // After the car was written off: the stint is never driven.
  retired?: boolean
  card: ReactNode
  // Penalties served in the stint, listed at the bottom of its card.
  penalties?: ReactNode[] | false
  // Incident that cut the stint short, under its card.
  incident?: ReactNode
  divider?: ReactNode
}

// One stint on the race rail: race time and lap at its start, hour marks along the card.
export function TimelineItem({ timelineStint, raceStart, isActive, isFirst, retired = false, card, penalties, incident, divider }: TimelineItemProps) {
  const { t } = useTranslation('raceDetails')
  const { start, startLap, hourMarks, status } = timelineStint
  const penaltyMarks = penalties ? timelineStint.penalties : []
  const after = status === 'after' && !retired

  return (
    <TimelineRow>
      <TimelineLabel $tone={retired ? 'muted' : after ? 'danger' : 'default'}>
        {after ? t('afterFinish') : `T+${formatRaceTime(start)}`}
        <span>{t('lapN', { lap: startLap })}</span>
      </TimelineLabel>
      <Rail $first={isFirst}>
        <RailDot $state={retired ? 'retired' : after ? 'after' : isActive ? 'active' : 'default'} />
      </Rail>
      <TimelineContent $after={after} $retired={retired} $spaced={!divider}>
        <CardSlot>
          {card}
          {hourMarks.map(mark => (
            <HourMark
              key={mark.hour}
              style={{ top: `max(${mark.offset * 100}%, 3.5rem)` }}
              title={t('hourMarkTitle', {
                hour: mark.hour,
                clock: clockAt(raceStart, mark.hour * 60),
                lap: mark.lap,
              })}
            >
              <span>{mark.hour} h</span>
            </HourMark>
          ))}
          {penaltyMarks.map(mark => {
            // Next to an hour mark it moves aside (above it when served before the hour).
            const hour = hourMarks.find(hourMark => Math.abs(hourMark.offset - mark.offset) < PENALTY_MARK_GAP)
            const shift = hour ? (mark.offset < hour.offset ? ' - 1.25rem' : ' + 1.25rem') : ''
            return (
              <PenaltyRailMark
                key={`penalty-${mark.index}`}
                style={{ top: `calc(max(${mark.offset * 100}%, 3.5rem)${shift})` }}
                title={t('penaltyMarkTitle', {
                  type: t(`penaltyTypes.${mark.penalty.type}`),
                  lap: mark.penalty.lap,
                  clock: clockAt(raceStart, mark.at),
                  time: formatPenaltyTime(mark.minutes * 60),
                })}
              >
                <span>{PENALTY_SHORT[mark.penalty.type]}</span>
              </PenaltyRailMark>
            )
          })}
          {penalties && penalties.length > 0 && <PenaltyList>{penalties}</PenaltyList>}
        </CardSlot>
        {incident}
        {divider}
      </TimelineContent>
    </TimelineRow>
  )
}

interface PenaltyItemProps {
  mark: PenaltyMark
  // Clock when the car enters the pit lane.
  clock: string
  onDelete: () => void
}

// One penalty in the list at the bottom of its stint's card.
export function PenaltyItem({ mark, clock, onDelete }: PenaltyItemProps) {
  const { t } = useTranslation('raceDetails')
  const { penalty } = mark

  return (
    <PenaltyRow role="note">
      <PenaltyIcon />
      <PenaltyShort>{PENALTY_SHORT[penalty.type]}</PenaltyShort>
      <PenaltyText>
        {penalty.type === 'stopAndGo'
          ? t('penaltyStopAndGo', { seconds: penalty.stopSeconds ?? 0 })
          : t('penaltyTypes.driveThrough')}
        <span>{t('incidentOnLap', { lap: penalty.lap })} · {clock} · {formatPenaltyTime(mark.minutes * 60)}</span>
      </PenaltyText>
      <IconButton onClick={onDelete} title={t('deletePenalty')} icon={TrashIcon} size="sm" />
    </PenaltyRow>
  )
}

interface IncidentItemProps {
  incident: Incident
  // Clock when it happened: the end of the cut stint.
  clock: string
  onDelete: () => void
}

// Tile under a stint cut short by an incident.
export function IncidentItem({ incident, clock, onDelete }: IncidentItemProps) {
  const { t } = useTranslation('raceDetails')

  return (
    <IncidentTile role="note" $color={INCIDENT_COLORS[incident.type]} $soft={incidentSoft(incident.type)}>
      <IncidentIcon type={incident.type} />
      <IncidentText>
        {t(`incidentTypes.${incident.type}`)}
        <span>{t('incidentOnLap', { lap: incident.lap })} · {clock}</span>
      </IncidentText>
      <IconButton onClick={onDelete} title={t('deleteIncident')} icon={TrashIcon} size="sm" />
    </IncidentTile>
  )
}

interface FinishItemProps {
  timeline: Timeline
  raceStart: Date
  afterFinishOrders: number[]
  // The car was written off: the race ended in this stint, on this lap.
  retirement?: { order: number; lap: number }
  onAddStint: () => void
}

// Checkered flag under the last stint: when the time runs out and when the race ends.
export function FinishItem({ timeline, raceStart, afterFinishOrders, retirement, onAddStint }: FinishItemProps) {
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
              {clockAt(raceStart, finish.timeUpAt)}
              <span>{t('lapInProgress', { lap: finish.timeUpLap })}</span>
            </FinishValue>
          </StatItem>
          <StatItem>
            <StatLabel>{t('checkeredFlag')}</StatLabel>
            <FinishValue>
              {clockAt(raceStart, finish.flagAt)}
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
        {retirement ? (
          <FinishNote $tone="danger">{t('raceOver', retirement)}</FinishNote>
        ) : afterFinishOrders.length > 0 ? (
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
        {driven.flatMap(stint => stint.penalties.map(mark => {
          const label = `${PENALTY_SHORT[mark.penalty.type]} · ${stint.driver} · ${t('incidentOnLap', { lap: mark.penalty.lap })} · T+${formatRaceTime(mark.at)} · ${formatPenaltyTime(mark.minutes * 60)}`
          return (
            <StripPenalty
              key={`${stint.id}-${mark.index}`}
              style={{ left: pct(mark.at) }}
              title={label}
              aria-label={label}
              role="img"
            />
          )
        }))}
        {isLive && <StripNow style={{ left: pct(currentRaceTime) }} />}
      </Strip>
      <StripLegend>
        {driven.some(stint => stint.penalties.length > 0) && (
          <LegendItem>
            <LegendSwatch $line $bg="var(--text)" />
            {t('penalties')}
          </LegendItem>
        )}
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
