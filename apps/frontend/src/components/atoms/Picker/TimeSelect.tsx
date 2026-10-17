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

const Scroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
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

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`

const ListItem = styled(PickerCell)`
  width: 100%;
  justify-content: flex-start;
  padding: 0.375rem 0.625rem;
`

const EmptyItem = styled(ListItem)`
  font-weight: 600;
`

// A time picked from a plain list, one under another, optionally grouped (e.g. by day).
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

  // Up and down arrows move through the list.
  const handleListKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    const cells = [...(popoverRef.current?.querySelectorAll<HTMLButtonElement>('[data-cell]') ?? [])]
    const index = cells.indexOf(document.activeElement as HTMLButtonElement)
    const next = cells[index < 0 ? 0 : index + (e.key === 'ArrowUp' ? -1 : 1)]
    if (next) {
      e.preventDefault()
      next.focus()
      next.scrollIntoView({ block: 'nearest' })
    }
  }

  const empty = emptyOption && (
    <EmptyItem
      type="button"
      data-cell
      role="option"
      aria-selected={value === ''}
      $selected={value === ''}
      onClick={() => choose('')}
    >
      {emptyOption.label}
    </EmptyItem>
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
        <Popover ref={popoverRef} $align={align} $width="max(100%, 9rem)" role="listbox" aria-label={ariaLabel} onKeyDown={handleListKeys}>
          <Scroll>
            {emptyOption?.position === 'start' && empty}
            {groups.map(group => (
              <Group key={group.label || 'times'}>
                {group.label && <GroupLabel>{group.label}</GroupLabel>}
                {group.options.map(option => (
                  <ListItem
                    key={option.value}
                    type="button"
                    data-cell
                    role="option"
                    aria-selected={option.value === value}
                    $selected={option.value === value}
                    onClick={() => choose(option.value)}
                  >
                    {option.label}
                  </ListItem>
                ))}
              </Group>
            ))}
            {emptyOption?.position === 'end' && empty}
          </Scroll>
        </Popover>
      )}
    </PickerContainer>
  )
}
