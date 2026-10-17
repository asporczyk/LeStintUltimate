import { useTranslation } from 'react-i18next'
import { type DriverAvailability } from 'types/Race'
import { driverBlocks } from 'utils/availability'
import { NumberInput } from './EditRaceModal.styles'
import {
  AvailabilityList,
  AvailabilityDriverGroup,
  AvailabilityDriver,
  AvailabilityBlocks,
  AvailabilityRow,
  AvailabilityField,
  AvailabilityFieldLabel,
  RemoveBlockButton,
  AddBlockButton
} from './DriverAvailabilityFields.styles'

interface DriverAvailabilityFieldsProps {
  drivers: string[]
  availability: DriverAvailability[]
  onChange: (availability: DriverAvailability[]) => void
}

// Blocks of real clock hours each driver can drive, one entry per block. Empty "from" = from
// the start, empty "to" = to the end. A driver without blocks shows one empty block.
export function DriverAvailabilityFields({ drivers, availability, onChange }: DriverAvailabilityFieldsProps) {
  const { t } = useTranslation('raceDetails')

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
          setBlocks(driver, blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)))

        return (
          <AvailabilityDriverGroup key={driver}>
            <AvailabilityDriver title={driver}>{driver}</AvailabilityDriver>
            <AvailabilityBlocks>
              {blocks.map((block, index) => (
                <AvailabilityRow key={index}>
                  <AvailabilityField>
                    <AvailabilityFieldLabel>{t('availableFrom')}</AvailabilityFieldLabel>
                    <NumberInput
                      type="time"
                      value={block.from}
                      onChange={e => update(index, { from: e.target.value })}
                      aria-label={`${driver} ${index + 1}: ${t('availableFrom')}`}
                    />
                  </AvailabilityField>
                  <AvailabilityField>
                    <AvailabilityFieldLabel>{t('availableTo')}</AvailabilityFieldLabel>
                    <NumberInput
                      type="time"
                      value={block.to}
                      onChange={e => update(index, { to: e.target.value })}
                      aria-label={`${driver} ${index + 1}: ${t('availableTo')}`}
                    />
                  </AvailabilityField>
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
