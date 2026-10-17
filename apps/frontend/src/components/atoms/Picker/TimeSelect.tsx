import { useEffect, useRef, type KeyboardEvent } from 'react'
import styled from 'styled-components'
import { usePopover } from './usePopover'
import { PickerContainer, PickerTrigger, TriggerPrefix, TriggerValue, Popover, PickerCell } from './Picker.styles'
import { ClockIcon, ChevronIcon } from './PickerIcons'

export interface TimeSelectOption {
  value: string
  label: string
  // Small mark after the time, e.g. "+1" for the next day.
  badge?: string
}

export interface TimeSelectGroup {
  label: string
  options: TimeSelectOption[]
}

interface TimeSelectProps {
  value: string
  onChange: (value: string) => void
  groups: TimeSelectGroup[]
  // The choice for no time (value ''), e.g. "race start", shown before or after the times.
  emptyOption?: { label: string; position: 'start' | 'end' }
  prefix?: string
  placeholder?: string
  ariaLabel?: string
  align?: 'left' | 'right'
}

const COLUMNS = 4

const minuteOf = (option: TimeSelectOption) => Number(option.label.split(':')[1] ?? 0)

// Options split into rows of one hour each (labels are "HH:MM").
function hourRows(options: TimeSelectOption[]): TimeSelectOption[][] {
  const rows: TimeSelectOption[][] = []
  options.forEach(option => {
    const last = rows[rows.length - 1]
    if (last && last[0].label.slice(0, 2) === option.label.slice(0, 2)) last.push(option)
    else rows.push([option])
  })
  return rows
}

// Quarter-hour times keep their column (:00, :15, :30, :45), so a row that starts at :30
// lines up with the full rows; a row with other minutes simply flows.
function quarterColumn(row: TimeSelectOption[], option: TimeSelectOption): number | undefined {
  return row.every(o => minuteOf(o) % 15 === 0) ? minuteOf(option) / 15 + 1 : undefined
}

const Scroll = styled.div`
  max-height: 16rem;
  overflow-y: auto;
  overscroll-behavior: contain;
`

const GroupLabel = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 0.375rem 0.25rem 0.25rem;
  background: ${({ theme }) => theme.colors.surface};
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${COLUMNS}, minmax(0, 1fr));
  gap: 0.125rem;
  margin-bottom: 0.25rem;
`

const WideCell = styled(PickerCell)`
  width: 100%;
  margin: 0.125rem 0;
  font-weight: 600;
`

// A time picked from a fixed list, grouped by day and laid out an hour per row.
export function TimeSelect({ value, onChange, groups, emptyOption, prefix, placeholder = '--:--', ariaLabel, align = 'left' }: TimeSelectProps) {
  const { isOpen, setIsOpen, containerRef, onKeyDown } = usePopover()
  const popoverRef = useRef<HTMLDivElement>(null)
  const selected = groups.flatMap(group => group.options).find(option => option.value === value)

  // Open on the chosen time.
  useEffect(() => {
    if (!isOpen) return
    const cells = popoverRef.current?.querySelectorAll<HTMLButtonElement>('[data-cell]')
    const current = popoverRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')
    const target = current ?? cells?.[0]
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: 'center' })
  }, [isOpen])

  const choose = (next: string) => {
    onChange(next)
    setIsOpen(false)
  }

  // Arrows move through the grid: left/right by a time, up/down to the nearest time in the
  // row above or below.
  const handleGridKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    const cells = [...(popoverRef.current?.querySelectorAll<HTMLButtonElement>('[data-cell]') ?? [])]
    const current = document.activeElement as HTMLButtonElement
    const index = cells.indexOf(current)
    let next: HTMLButtonElement | undefined
    if (index < 0) {
      next = cells[0]
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      next = cells[index + (e.key === 'ArrowLeft' ? -1 : 1)]
    } else {
      const from = current.getBoundingClientRect()
      const down = e.key === 'ArrowDown'
      const candidates = cells.filter(cell => {
        const top = cell.getBoundingClientRect().top
        return down ? top > from.top + 1 : top < from.top - 1
      })
      const rowTop = down
        ? Math.min(...candidates.map(cell => cell.getBoundingClientRect().top))
        : Math.max(...candidates.map(cell => cell.getBoundingClientRect().top))
      next = candidates
        .filter(cell => Math.abs(cell.getBoundingClientRect().top - rowTop) < 1)
        .sort((a, b) => Math.abs(a.getBoundingClientRect().left - from.left) - Math.abs(b.getBoundingClientRect().left - from.left))[0]
    }
    if (next) {
      e.preventDefault()
      next.focus()
      next.scrollIntoView({ block: 'nearest' })
    }
  }

  const empty = emptyOption && (
    <WideCell
      type="button"
      data-cell
      role="option"
      aria-selected={value === ''}
      $selected={value === ''}
      onClick={() => choose('')}
    >
      {emptyOption.label}
    </WideCell>
  )

  return (
    <PickerContainer ref={containerRef} onKeyDown={onKeyDown}>
      <PickerTrigger
        type="button"
        $open={isOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen(!isOpen)}
      >
        {prefix ? <TriggerPrefix>{prefix}</TriggerPrefix> : <ClockIcon />}
        <TriggerValue $placeholder={!selected && !(value === '' && emptyOption)}>
          {selected ? (
            <>
              {selected.label}
              {selected.badge && <small>{selected.badge}</small>}
            </>
          ) : value === '' && emptyOption ? emptyOption.label : value || placeholder}
        </TriggerValue>
        <ChevronIcon />
      </PickerTrigger>
      {isOpen && (
        <Popover ref={popoverRef} $align={align} $width="16rem" role="listbox" aria-label={ariaLabel} onKeyDown={handleGridKeys}>
          <Scroll>
            {emptyOption?.position === 'start' && empty}
            {groups.map(group => (
              <div key={group.label}>
                <GroupLabel>{group.label}</GroupLabel>
                {hourRows(group.options).map(row => (
                  <Grid key={row[0].value}>
                    {row.map(option => (
                      <PickerCell
                        key={option.value}
                        type="button"
                        data-cell
                        role="option"
                        aria-selected={option.value === value}
                        $selected={option.value === value}
                        style={{ gridColumn: quarterColumn(row, option) }}
                        onClick={() => choose(option.value)}
                      >
                        {option.label}
                      </PickerCell>
                    ))}
                  </Grid>
                ))}
              </div>
            ))}
            {emptyOption?.position === 'end' && empty}
          </Scroll>
        </Popover>
      )}
    </PickerContainer>
  )
}
