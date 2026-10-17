import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { usePopover } from './usePopover'
import { PickerContainer, PickerTrigger, TriggerValue, Popover, PickerCell } from './Picker.styles'
import { ClockIcon, ChevronIcon } from './PickerIcons'

interface TimePickerProps {
  // "HH:MM"
  value: string
  onChange: (value: string) => void
  minuteStep?: number
  ariaLabel?: string
}

const pad = (n: number) => String(n).padStart(2, '0')

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.375rem;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  max-height: 14rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
`

const ColumnLabel = styled.div`
  padding: 0 0.25rem 0.375rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`

// A clock time from two columns: hours, then minutes in steps (a saved minute off the
// step stays on the list).
export function TimePicker({ value, onChange, minuteStep = 5, ariaLabel }: TimePickerProps) {
  const { t } = useTranslation('common')
  const { isOpen, setIsOpen, containerRef, onKeyDown } = usePopover()
  const popoverRef = useRef<HTMLDivElement>(null)
  const [hour = 0, minute = 0] = (value || '00:00').split(':').map(Number)
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep)
  if (!minutes.includes(minute)) minutes.push(minute)
  minutes.sort((a, b) => a - b)

  // Open with the chosen hour and minute in the middle of their columns.
  useEffect(() => {
    if (!isOpen) return
    popoverRef.current?.querySelectorAll<HTMLElement>('[aria-selected="true"]').forEach(cell => {
      const column = cell.parentElement
      if (column) column.scrollTop = cell.offsetTop - column.offsetTop - column.clientHeight / 2 + cell.clientHeight / 2
    })
    popoverRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus({ preventScroll: true })
  }, [isOpen])

  return (
    <PickerContainer ref={containerRef} onKeyDown={onKeyDown}>
      <PickerTrigger
        type="button"
        $open={isOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ClockIcon />
        <TriggerValue $placeholder={!value}>{value ? `${pad(hour)}:${pad(minute)}` : '--:--'}</TriggerValue>
        <ChevronIcon />
      </PickerTrigger>
      {isOpen && (
        <Popover ref={popoverRef} $width="9.5rem" role="dialog" aria-label={ariaLabel}>
          <Columns>
            <div>
              <ColumnLabel>{t('hourShort')}</ColumnLabel>
              <Column role="listbox" aria-label={t('hourShort')}>
                {Array.from({ length: 24 }, (_, h) => (
                  <PickerCell
                    key={h}
                    type="button"
                    role="option"
                    aria-selected={h === hour}
                    $selected={h === hour}
                    onClick={() => onChange(`${pad(h)}:${pad(minute)}`)}
                  >
                    {pad(h)}
                  </PickerCell>
                ))}
              </Column>
            </div>
            <div>
              <ColumnLabel>{t('minuteShort')}</ColumnLabel>
              <Column role="listbox" aria-label={t('minuteShort')}>
                {minutes.map(m => (
                  <PickerCell
                    key={m}
                    type="button"
                    role="option"
                    aria-selected={m === minute}
                    $selected={m === minute}
                    onClick={() => {
                      onChange(`${pad(hour)}:${pad(m)}`)
                      setIsOpen(false)
                    }}
                  >
                    {pad(m)}
                  </PickerCell>
                ))}
              </Column>
            </div>
          </Columns>
        </Popover>
      )}
    </PickerContainer>
  )
}
