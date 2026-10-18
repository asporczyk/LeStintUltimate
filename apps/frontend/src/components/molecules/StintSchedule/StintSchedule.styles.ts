import styled, { css } from 'styled-components'
import { fieldStyles, fullBleedOnMobile, MOBILE_QUERY } from 'styles/theme'

export const ScheduleContainer = styled.section`
  width: 100%;
  min-width: 0;
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  ${fullBleedOnMobile}

  @media ${MOBILE_QUERY} {
    padding: 1.125rem 1rem 1.25rem;
  }
`

export const ScheduleTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1rem;

  &::before {
    content: '';
    width: 4px;
    height: 1.1em;
    border-radius: 2px;
    background: ${({ theme }) => theme.colors.primary};
  }
`

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
`

const TableHead = styled.thead`
  background: ${({ theme }) => theme.colors.surfaceRaised};
`

const TableHeader = styled.th`
  font-size: 0.6875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.625rem 0.875rem;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const TableBody = styled.tbody`
  tr:last-child > td {
    border-bottom: none;
  }
`

const TableCell = styled.td`
  font-size: 0.9375rem;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text};
  padding: 0.5rem 0.875rem;
  height: 3rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  white-space: nowrap;
  vertical-align: middle;
`

export const MutedValue = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`

export const ActiveIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.success};
  border-radius: 50%;
  margin-left: 0.5rem;
  vertical-align: middle;
  box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.successSoft};
`

export const InsertButton = styled.button`
  position: sticky;
  left: 0.5rem;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 1.625rem;
  padding: 0 0.75rem 0 0.5rem;
  border: none;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.primarySoft};
  opacity: 0;
  pointer-events: none;
  transform: translateX(-6px);
  transition: opacity 0.15s ease, transform 0.15s ease, background 0.15s ease;

  svg {
    width: 0.875rem;
    height: 0.875rem;
    stroke: currentColor;
    stroke-width: 3;
    flex-shrink: 0;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  /* Bigger tap target than the visible button. */
  &::after {
    content: '';
    position: absolute;
    inset: -10px;
  }
`

// Reports an incident in the stint above, on the right of the divider. Yellow like a
// warning flag; offered even when the plan already covers the race.
export const IncidentButton = styled.button`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  height: 1.625rem;
  margin-left: auto;
  padding: 0 0.75rem 0 0.5rem;
  border: none;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.tireUsed};
  color: #0B1238;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transform: translateX(6px);
  transition: opacity 0.15s ease, transform 0.15s ease, filter 0.15s ease;

  svg {
    width: 0.875rem;
    height: 0.875rem;
    stroke-width: 2.5;
    flex-shrink: 0;
  }

  &:hover {
    filter: brightness(1.08);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.text};
    outline-offset: 2px;
  }

  /* Bigger tap target than the visible button. */
  &::after {
    content: '';
    position: absolute;
    inset: -10px;
  }
`

// Adds a penalty served in the stint above, next to the incident button. Black and white
// like the race director's black flag.
export const PenaltyButton = styled(IncidentButton)<{ $alone?: boolean }>`
  margin-left: ${({ $alone }) => $alone ? 'auto' : '0.375rem'};
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.surface};
`

// Divider between stints. Pointing at it opens a gap with an "insert stint" button
// on the left and an "incident" one on the right; touch screens get small round buttons
// sitting on the divider instead. Under the stint in progress the incident button stays.
export const InsertBar = styled.div<{ $pinned?: boolean; $canInsert?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  height: 10px;
  transition: height 0.15s ease;

  ${({ $pinned }) => $pinned && css`
    height: 36px;

    ${IncidentButton} {
      opacity: 1;
      pointer-events: auto;
      transform: none;
    }
  `}

  /* Hidden until hovered: a red line that fades out to the right. */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: transparent;
    transition: background 0.15s ease;
  }

  @media (hover: hover) {
    &:hover,
    &:focus-within {
      height: 36px;

      /* The line belongs to the insert button: none without it or over the incident one. */
      ${({ $canInsert }) => $canInsert && css`
        &:not(:has(${IncidentButton}:hover, ${IncidentButton}:focus-visible))::before {
          height: 2px;
          margin-top: -1px;
          background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary} 0%, transparent 70%);
        }
      `}

      ${InsertButton}, ${IncidentButton} {
        opacity: 1;
        pointer-events: auto;
        transform: none;
      }
    }
  }

  /* Touch: no hover, so each gap keeps a quiet "+" in line with the # column. */
  @media (hover: none) {
    height: 22px;

    ${InsertButton} {
      opacity: 1;
      pointer-events: auto;
      transform: none;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      justify-content: center;
      background: ${({ theme }) => theme.colors.surface};
      color: ${({ theme }) => theme.colors.textMuted};
      border: 1px solid ${({ theme }) => theme.colors.borderStrong};
      box-shadow: none;

      svg {
        width: 0.75rem;
        height: 0.75rem;
      }

      .label {
        display: none;
      }

      &:active {
        background: ${({ theme }) => theme.colors.primary};
        border-color: ${({ theme }) => theme.colors.primary};
        color: ${({ theme }) => theme.colors.onPrimary};
      }
    }

    ${IncidentButton} {
      opacity: 1;
      pointer-events: auto;
      transform: none;
      width: 1.375rem;
      height: 1.375rem;
      padding: 0;
      justify-content: center;

      svg {
        width: 0.8125rem;
        height: 0.8125rem;
      }

      .label {
        display: none;
      }
    }
  }
`

export const NotesContainer = styled.div`
  width: 100%;
  margin-top: 1.5rem;
`

export const NotesLabel = styled.label`
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  display: block;
  margin-bottom: 0.5rem;
`

export const NotesTextarea = styled.textarea`
  ${fieldStyles}
  min-height: 84px;
  resize: vertical;
  line-height: 1.5;
`

export const CharCount = styled.span<{ $isOver: boolean }>`
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: ${({ $isOver, theme }) => $isOver ? theme.colors.danger : theme.colors.textMuted};
`

export const NotesFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 2.25rem;
  margin-top: 0.375rem;
`

export const DriverSummaryContainer = styled.div`
  width: 100%;
  margin-top: 1.5rem;
`

export const DriverSummaryTitle = styled.h3`
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  /* Anchors the tooltip, so it stays within the heading's width on phones. */
  position: relative;
`

export const MinimumRequirementInfoIcon = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.6875rem;
  font-weight: 700;
  cursor: help;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.text};
  }
`

export const MinimumRequirementTooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 0;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  padding: 0.875rem 1rem;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 0.8125rem;
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  box-shadow: ${({ theme }) => theme.colors.shadow};
  width: max-content;
  max-width: min(300px, 100%);

  p {
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`

export const MinimumRequirementList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-variant-numeric: tabular-nums;

    &::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.warning};
      flex-shrink: 0;
    }
  }
`

export const MinimumRequirementIconWrapper = styled.div`
  display: inline-flex;

  &:hover ${MinimumRequirementTooltip},
  &:focus-within ${MinimumRequirementTooltip} {
    opacity: 1;
  }
`

export const DriverSwatch = styled.span<{ $bg: string }>`
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  margin-right: 0.625rem;
  border-radius: 3px;
  vertical-align: -1px;
  background: ${({ $bg }) => $bg};
`

export const DriverSummaryTable = styled.table`
  width: 100%;
  margin-top: 1rem;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;

  @media ${MOBILE_QUERY} {
    width: calc(100% + 2rem);
    max-width: none;
    margin-inline: -1rem;
    border-left: none;
    border-right: none;
    border-radius: 0;
  }
`

export const DriverSummaryHead = styled(TableHead)``

export const DriverSummaryHeader = styled(TableHeader)``

export const DriverSummaryBody = styled(TableBody)``

export const DriverSummaryRow = styled.tr`
  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`

const DriverSummaryCell = styled(TableCell)`
  height: 2.5rem;
`

export const DriverNameCell = styled(DriverSummaryCell)`
  font-weight: 600;
`

export const TotalTimeCell = styled(DriverSummaryCell)`
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const RacePercentageCell = styled(DriverSummaryCell)`
  font-weight: 700;
`

export const MinimumRequirementWarning = styled.div`
  background: ${({ theme }) => theme.colors.warningSoft};
  border: 1px solid ${({ theme }) => theme.colors.warning};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 0.75rem 1rem;
  margin-top: 0.75rem;
  color: ${({ theme }) => theme.colors.warning};
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '⚠';
    font-size: 1.125rem;
    flex-shrink: 0;
  }
`

export const DriverSummaryRowBelowMinimum = styled(DriverSummaryRow)`
  &,
  &:hover {
    background: ${({ theme }) => theme.colors.warningSoft};
  }

  td {
    color: ${({ theme }) => theme.colors.warning};
  }
`
