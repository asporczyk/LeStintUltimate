import styled from 'styled-components'
import { MOBILE_QUERY } from 'styles/theme'
import { InsertBar } from './StintSchedule.styles'

// Wide enough for a stint to fit on one line.
const WIDE_QUERY = '(min-width: 1000px)'

// One card per session or stint. Wide screens: a single row inside a rounded list;
// narrower ones: stacked, and edge to edge on phones.
export const CardList = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;

  /* The list border already closes the last card. */
  & > :last-child ${InsertBar}:not(:hover):not(:focus-within)::before {
    opacity: 0;
  }

  @media ${MOBILE_QUERY} {
    & > :last-child ${InsertBar}::before {
      opacity: 1;
    }

    margin-inline: -1rem;
    border-left: none;
    border-right: none;
    border-bottom: none;
    border-radius: 0;
  }
`

export const Card = styled.article<{ $isActive?: boolean; $hasBadge: boolean }>`
  display: grid;
  grid-template-columns: ${({ $hasBadge }) => $hasBadge ? 'auto minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto'};
  grid-template-areas: ${({ $hasBadge }) => $hasBadge
    ? `'badge time actions' 'people people people' 'stats stats stats'`
    : `'time actions' 'people people' 'stats stats'`};
  align-items: center;
  gap: 0.625rem 0.75rem;
  padding: 0.875rem 1rem;
  background: ${({ $isActive, theme }) => $isActive ? theme.colors.successSoft : 'transparent'};
  box-shadow: ${({ $isActive, theme }) => $isActive ? `inset 3px 0 0 ${theme.colors.success}` : 'none'};
  transition: background 0.15s ease;

  /* Same columns with or without a badge, so all sections line up. */
  @media ${WIDE_QUERY} {
    grid-template-columns: 2.25rem minmax(150px, 1fr) minmax(120px, 1fr) minmax(300px, 2.2fr) 5rem;
    grid-template-areas: 'badge time people stats actions';
    gap: 1.5rem;
    padding: 1rem 1.25rem;

    &:hover {
      background: ${({ $isActive, theme }) => $isActive ? theme.colors.successSoft : theme.colors.surfaceHover};
    }
  }
`

export const CardBadge = styled.span`
  grid-area: badge;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: start;
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0 0.375rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`

export const CardTime = styled.div`
  grid-area: time;
  display: flex;
  flex-direction: column;
  min-width: 0;
`

export const TimeRange = styled.span`
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
`

export const Duration = styled.span`
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.textMuted};
`

export const CardActions = styled.div`
  grid-area: actions;
  display: flex;
  justify-content: flex-end;
  gap: 0.375rem;
`

export const People = styled.div`
  grid-area: people;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  min-width: 0;

  @media ${WIDE_QUERY} {
    flex-direction: column;
    gap: 0.125rem;
  }
`

export const DriverName = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 1.0625rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`

export const Spotter = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Stats = styled.dl`
  grid-area: stats;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
`

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
`

export const StatLabel = styled.dt`
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const StatValue = styled.dd`
  display: flex;
  align-items: center;
  min-height: 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text};
`

// Four wheels seen from above: front pair on top, filled when the tire is changed.
export const TireGrid = styled.span`
  display: inline-grid;
  grid-template-columns: repeat(2, 0.625rem);
  grid-template-rows: repeat(2, 0.875rem);
  column-gap: 0.625rem;
  row-gap: 0.25rem;
`

export const Tire = styled.span<{ $changed: boolean }>`
  border-radius: 3px;
  border: 1.5px solid ${({ $changed, theme }) => $changed ? theme.colors.success : theme.colors.borderStrong};
  background: ${({ $changed, theme }) => $changed ? theme.colors.success : 'transparent'};
`
