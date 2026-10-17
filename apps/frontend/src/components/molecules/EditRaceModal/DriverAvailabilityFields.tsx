import { useTranslation } from 'react-i18next'
import { type DriverAvailability } from 'types/Race'
import { driverBlocks, hourMinute, hourOptions, type HourOption } from 'utils/availability'
import { TimeSelect, type TimeSelectGroup } from 'components/atoms/Picker/TimeSelect'
import {
  AvailabilityList,
  AvailabilityDriverGroup,
  AvailabilityDriver,
  AvailabilityBlocks,
  AvailabilityRow,
  RemoveBlockButton,
  AddBlockButton
} from './DriverAvailabilityFields.styles'

interface DriverAvailabilityFieldsProps {
  drivers: string[]
  availability: DriverAvailability[]
  onChange: (availability: DriverAvailability[]) => void
  // The session the hours are picked from: event start (training), race start and length.
  eventDate: string
  eventStartClock: string
  raceStartClock: string
  raceLength: number
}

// Blocks of real clock hours each driver can drive, one entry per block. Empty "from" = from
// the start, empty "to" = to the end. A driver without blocks shows one empty block. Hours
// are picked every 15 minutes from the event start until the race is over.
export function DriverAvailabilityFields({ drivers, availability, onChange, eventDate, eventStartClock, raceStartClock, raceLength }: DriverAvailabilityFieldsProps) {
  const { t, i18n } = useTranslation('raceDetails')
  const locale = i18n.resolvedLanguage ?? i18n.language
  const saved = availability.flatMap(({ from, to }) => [from, to])
  const options = hourOptions(eventStartClock, raceStartClock, raceLength, saved)

  // Times grouped by calendar day, e.g. "Sat, 20 Dec".
  const dayLabel = (day: number) => {
    if (!eventDate) return t('dayN', { day: day + 1 })
    const [y, m, d] = eventDate.split('-').map(Number)
    return new Date(y, m - 1, d + day).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  }
  const toGroups = (list: HourOption[]): TimeSelectGroup[] => {
    const groups: (TimeSelectGroup & { day: number })[] = []
    list.forEach(option => {
      const last = groups[groups.length - 1]
      const entry = { value: option.value, label: option.clock }
      if (last && last.day === option.day) last.options.push(entry)
      else groups.push({ day: option.day, label: dayLabel(option.day), options: [entry] })
    })
    return groups
  }
  // "From" can't be the last hour; "to" comes after "from".
  const fromGroups = toGroups(options.slice(0, -1))
  const toGroupsAfter = (from: string) => {
    const after = from ? hourMinute(from, eventStartClock) : 0
    return toGroups(options.filter(option => option.minute > after))
  }

  const blocksOf = (driver: string) => {
    const blocks = driverBlocks(availability, driver)
    return blocks.length ? blocks : [{ driver, from: '', to: '' }]
  }

  const setBlocks = (driver: string, blocks: DriverAvailability[]) =>
    onChange([...availability.filter(entry => entry.driver !== driver), ...blocks])

  return (
    <AvailabilityList>
      {drivers.map(driver => {
        const blocks = blocksOf(driver)
        const isEmpty = blocks.length === 1 && !blocks[0].from && !blocks[0].to
        const update = (index: number, patch: Partial<DriverAvailability>) =>
          setBlocks(driver, blocks.map((block, i) => {
            if (i !== index) return block
            const next = { ...block, ...patch }
            // A "to" no longer after "from" goes back to the finish.
            if (next.from && next.to && hourMinute(next.to, eventStartClock, true) <= hourMinute(next.from, eventStartClock)) {
              next.to = ''
            }
            return next
          }))

        return (
          <AvailabilityDriverGroup key={driver}>
            <AvailabilityDriver title={driver}>{driver}</AvailabilityDriver>
            <AvailabilityBlocks>
              {blocks.map((block, index) => (
                <AvailabilityRow key={index}>
                  <TimeSelect
                    value={block.from}
                    onChange={value => update(index, { from: value })}
                    groups={fromGroups}
                    emptyOption={{ label: t('fromStart'), position: 'start' }}
                    prefix={t('availableFrom')}
                    ariaLabel={`${driver} ${index + 1}: ${t('availableFrom')}`}
                  />
                  <TimeSelect
                    value={block.to}
                    onChange={value => update(index, { to: value })}
                    groups={toGroupsAfter(block.from)}
                    emptyOption={{ label: t('toFinish'), position: 'end' }}
                    prefix={t('availableTo')}
                    ariaLabel={`${driver} ${index + 1}: ${t('availableTo')}`}
                    align="right"
                  />
                  <RemoveBlockButton
                    type="button"
                    onClick={() => setBlocks(driver, blocks.filter((_, i) => i !== index))}
                    disabled={isEmpty}
                    title={t('removeAvailabilityBlock')}
                    aria-label={`${driver} ${index + 1}: ${t('removeAvailabilityBlock')}`}
                  >
                    ×
                  </RemoveBlockButton>
                </AvailabilityRow>
              ))}
              {!isEmpty && (
                <AddBlockButton
                  type="button"
                  onClick={() => setBlocks(driver, [...blocks, { driver, from: '', to: '' }])}
                  aria-label={`${driver}: ${t('addAvailabilityBlock')}`}
                >
                  + {t('addAvailabilityBlock')}
                </AddBlockButton>
              )}
            </AvailabilityBlocks>
          </AvailabilityDriverGroup>
        )
      })}
    </AvailabilityList>
  )
}
