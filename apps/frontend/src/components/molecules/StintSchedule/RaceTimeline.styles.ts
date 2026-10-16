import styled from 'styled-components'
import { MOBILE_QUERY } from 'styles/theme'

const LABEL_WIDTH = '4.75rem'
const LABEL_WIDTH_MOBILE = '3.25rem'
const RAIL_WIDTH = '2.75rem'
const RAIL_WIDTH_MOBILE = '2.25rem'
// Vertical position of a stint's dot: level with the time range in its card.
const DOT_TOP = '1.5rem'

// Race-time gutter left of the stint cards: elapsed time, lap and a rail through all stints.
export const TimelineRow = styled.div`
  display: grid;
  grid-template-columns: ${LABEL_WIDTH} ${RAIL_WIDTH} minmax(0, 1fr);

  @media ${MOBILE_QUERY} {
    grid-template-columns: ${LABEL_WIDTH_MOBILE} ${RAIL_WIDTH_MOBILE} minmax(0, 1fr);
  }
`

export const TimelineLabel = styled.div<{ $tone?: 'default' | 'danger' | 'strong' }>`
  padding: 1rem 0 0 0.75rem;
  text-align: right;
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
  color: ${({ $tone, theme }) => $tone === 'danger' ? theme.colors.danger : theme.colors.text};

  span {
    display: block;
    font-size: 0.6875rem;
    font-weight: 500;
    color: ${({ $tone, theme }) => $tone === 'danger' ? theme.colors.danger : theme.colors.textMuted};
  }

  @media ${MOBILE_QUERY} {
    padding: 1rem 0 0 0.375rem;
    font-size: 0.75rem;
  }
`

export const Rail = styled.div<{ $first?: boolean; $last?: boolean }>`
  position: relative;
  display: flex;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: ${({ $first }) => $first ? DOT_TOP : '0'};
    bottom: ${({ $last }) => $last ? `calc(100% - ${DOT_TOP})` : '0'};
    width: 2px;
    background: ${({ theme }) => theme.colors.borderStrong};
  }
`

export const RailDot = styled.span<{ $state?: 'default' | 'active' | 'after' | 'finish' }>`
  position: relative;
  margin-top: calc(${DOT_TOP} - 6px);
  width: 12px;
  height: 12px;
  border-radius: ${({ $state }) => $state === 'finish' ? '3px' : '50%'};
  background: ${({ $state, theme }) =>
    $state === 'active' ? theme.colors.success
    : $state === 'finish' ? theme.colors.text
    : theme.colors.surface};
  border: 2px solid ${({ $state, theme }) =>
    $state === 'active' ? theme.colors.success
    : $state === 'after' ? theme.colors.danger
    : $state === 'finish' ? theme.colors.text
    : theme.colors.textSecondary};
  box-shadow: ${({ $state, theme }) => $state === 'active' ? `0 0 0 4px ${theme.colors.successSoft}` : 'none'};
`

// Column with the stint card and the gap below it (which can hold the insert button).
export const TimelineContent = styled.div<{ $after?: boolean; $spaced?: boolean }>`
  min-width: 0;
  padding-bottom: ${({ $spaced }) => $spaced ? '10px' : '0'};
  opacity: ${({ $after }) => $after ? 0.55 : 1};

  @media ${MOBILE_QUERY} {
    padding-right: 0.5rem;

    /* The rail already spaces cards from the edge. */
    article {
      padding-left: 0.5rem;
      padding-right: 0.625rem;
    }
  }
`

// Each stint card in its own frame; also anchors the hour marks along its height.
export const CardSlot = styled.div`
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surface};

  article {
    border-radius: inherit;
  }
`

// "2 h" milestone on the rail, where the hour passes during the stint. Kept below the
// stint's dot when the hour falls right at its start.
export const HourMark = styled.div`
  position: absolute;
  right: 100%;
  width: ${RAIL_WIDTH};
  display: flex;
  justify-content: center;
  transform: translateY(-50%);

  span {
    padding: 0.0625rem 0.375rem;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.6875rem;
    font-weight: 700;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  @media ${MOBILE_QUERY} {
    width: ${RAIL_WIDTH_MOBILE};

    span {
      padding: 0 0.25rem;
      font-size: 0.625rem;
    }
  }
`

export const FinishCard = styled.div`
  margin: 0.25rem 0 0;
  padding: 1rem 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};

  @media ${MOBILE_QUERY} {
    margin-right: 0.5rem;
    padding: 0.875rem 1rem;
  }
`

export const FinishTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};

  svg {
    width: 1.125rem;
    height: 1.125rem;
  }
`

export const FinishStats = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.75rem;

  dt {
    white-space: normal;
  }

  @media ${MOBILE_QUERY} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

export const FinishValue = styled.dd`
  font-size: 1.0625rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text};

  span {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`

export const FinishNote = styled.div<{ $tone: 'success' | 'warning' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 0.875rem;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ $tone, theme }) => theme.colors[$tone]};
  background: ${({ $tone, theme }) => ({
    success: theme.colors.successSoft,
    warning: theme.colors.warningSoft,
    danger: theme.colors.primarySoft,
  })[$tone]};
`

export const StripContainer = styled.div`
  margin-top: 0.25rem;
`

export const StripHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`

export const StripTicks = styled.div`
  position: relative;
  height: 1.125rem;
  font-size: 0.6875rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.textMuted};

  span {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    white-space: nowrap;
  }

  span:first-child {
    transform: none;
  }

  span:last-child {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    transform: translateX(-100%);
    color: ${({ theme }) => theme.colors.text};
  }

  svg {
    width: 0.75rem;
    height: 0.75rem;
  }

  @media ${MOBILE_QUERY} {
    span[data-minor] {
      display: none;
    }
  }
`

export const Strip = styled.div`
  position: relative;
  height: 2.75rem;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
`

export const StripHourLine = styled.span`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: ${({ theme }) => theme.colors.border};
`

export const StripSegment = styled.button<{ $bg: string }>`
  position: absolute;
  top: 5px;
  bottom: 5px;
  min-width: 2px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: ${({ $bg }) => $bg};
  cursor: pointer;
  transition: filter 0.15s ease;

  &:hover {
    filter: brightness(1.12);
  }
`

export const StripGap = styled.div`
  position: absolute;
  top: 5px;
  bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 1px dashed ${({ theme }) => theme.colors.danger};
  background: repeating-linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primarySoft} 0 6px,
    transparent 6px 12px
  );
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.6875rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
`

export const StripNow = styled.span`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background: ${({ theme }) => theme.colors.primary};
`

export const StripLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-top: 0.625rem;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-variant-numeric: tabular-nums;
`

export const LegendSwatch = styled.span<{ $bg: string; $line?: boolean }>`
  width: ${({ $line }) => $line ? '2px' : '0.625rem'};
  height: 0.625rem;
  border-radius: ${({ $line }) => $line ? '0' : '3px'};
  background: ${({ $bg }) => $bg};
`
