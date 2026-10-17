import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { usePopover } from './usePopover'
import { PickerContainer, PickerTrigger, TriggerValue, Popover, PickerCell } from './Picker.styles'
import { CalendarIcon, ChevronIcon } from './PickerIcons'

interface DatePickerProps {
  // "YYYY-MM-DD"
  value: string
  onChange: (value: string) => void
  // Earliest day that can be picked, "YYYY-MM-DD".
  min?: string
  ariaLabel?: string
}

const pad = (n: number) => String(n).padStart(2, '0')
const toValue = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const fromValue = (value: string) => {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
`

const MonthTitle = styled.span`
  font-size: 0.9375rem;
  font-weight: 700;
  text-transform: capitalize;
  color: ${({ theme }) => theme.colors.text};
`

const NavButton = styled(PickerCell)`
  width: 2rem;
  height: 2rem;

  svg {
    width: 1rem;
    height: 1rem;
  }
`

const Days = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.125rem;
`

const Weekday = styled.span`
  padding: 0.25rem 0;
  font-size: 0.6875rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`

// A day from a month calendar, weeks starting on Monday, in the page language.
export function DatePicker({ value, onChange, min, ariaLabel }: DatePickerProps) {
  const { t, i18n } = useTranslation('common')
  const locale = i18n.resolvedLanguage ?? i18n.language
  const { isOpen, setIsOpen, containerRef, onKeyDown } = usePopover()
  const popoverRef = useRef<HTMLDivElement>(null)
  const selected = value ? fromValue(value) : null
  const [month, setMonth] = useState(() => {
    const base = selected ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  // Focus the chosen day (or the first one that can be picked) of the month shown.
  useEffect(() => {
    if (!isOpen) return
    const target = popoverRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?? popoverRef.current?.querySelector<HTMLElement>('[data-day]:not(:disabled)')
    target?.focus({ preventScroll: true })
  }, [isOpen, month])

  const today = toValue(new Date())
  const firstWeekday = (month.getDay() + 6) % 7
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ]
  // 2024-01-01 was a Monday.
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: 'short' }))
  const shiftMonth = (by: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1))
  const canGoBack = !min || toValue(new Date(month.getFullYear(), month.getMonth(), 0)) >= min

  // Arrows move by a day or a week, also into the next or previous month.
  const handleDayKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    const day = (document.activeElement as HTMLElement | null)?.dataset.day
    if (!(e.key in steps) || !day) return
    e.preventDefault()
    const next = fromValue(day)
    next.setDate(next.getDate() + steps[e.key])
    if (min && toValue(next) < min) return
    if (next.getMonth() !== month.getMonth()) setMonth(new Date(next.getFullYear(), next.getMonth(), 1))
    requestAnimationFrame(() => popoverRef.current?.querySelector<HTMLElement>(`[data-day="${toValue(next)}"]`)?.focus())
  }

  return (
    <PickerContainer ref={containerRef} onKeyDown={onKeyDown}>
      <PickerTrigger
        type="button"
        $open={isOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => {
          // Open on the chosen month.
          if (!isOpen) {
            const base = selected ?? new Date()
            setMonth(new Date(base.getFullYear(), base.getMonth(), 1))
          }
          setIsOpen(!isOpen)
        }}
      >
        <CalendarIcon />
        <TriggerValue $placeholder={!selected}>
          {selected
            ? selected.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
            : t('pickDate')}
        </TriggerValue>
        <ChevronIcon />
      </PickerTrigger>
      {isOpen && (
        <Popover ref={popoverRef} $width="17rem" role="dialog" aria-label={ariaLabel} onKeyDown={handleDayKeys}>
          <Header>
            <NavButton type="button" onClick={() => shiftMonth(-1)} disabled={!canGoBack} aria-label={t('previousMonth')}>
              <ChevronIcon direction="left" />
            </NavButton>
            <MonthTitle aria-live="polite">
              {month.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
            </MonthTitle>
            <NavButton type="button" onClick={() => shiftMonth(1)} aria-label={t('nextMonth')}>
              <ChevronIcon direction="right" />
            </NavButton>
          </Header>
          <Days role="grid">
            {weekdays.map(weekday => <Weekday key={weekday}>{weekday}</Weekday>)}
            {cells.map((date, i) => {
              if (!date) return <span key={`blank-${i}`} />
              const day = toValue(date)
              return (
                <PickerCell
                  key={day}
                  type="button"
                  data-day={day}
                  role="gridcell"
                  aria-selected={day === value}
                  aria-label={date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  $selected={day === value}
                  $today={day === today}
                  disabled={!!min && day < min}
                  onClick={() => {
                    onChange(day)
                    setIsOpen(false)
                  }}
                >
                  {date.getDate()}
                </PickerCell>
              )
            })}
          </Days>
        </Popover>
      )}
    </PickerContainer>
  )
}
