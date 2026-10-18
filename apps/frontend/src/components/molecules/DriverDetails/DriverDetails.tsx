import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { type Race } from 'types/Race'
import { availabilityLabel, driverBlocks } from 'utils/availability'
import { formatLapTime } from 'utils/time'
import { IconButton } from 'components/atoms/IconButton/IconButton'
import EditIcon from 'assets/svg/edit.svg'
import {
  DriverPills,
  DriverPill,
  DetailsPanel,
  DetailsList,
  DetailItem,
  DetailLabel,
  DetailValue
} from './DriverDetails.styles'

interface DriverDetailsProps {
  race: Race
  onEdit: (driver: string) => void
}

// Driver names as pills; a click shows that driver's settings, with an edit button.
export function DriverDetails({ race, onEdit }: DriverDetailsProps) {
  const { t } = useTranslation('raceDetails')
  const [selected, setSelected] = useState<string | null>(null)
  const drivers = race.drivers || []
  // A driver removed in the meantime closes the panel.
  const open = selected !== null && drivers.includes(selected) ? selected : null

  if (!drivers.length) return <dd>-</dd>

  const details = (driver: string): { label: string; value: ReactNode; inherited?: boolean }[] => {
    const hours = availabilityLabel(driverBlocks(race.driverAvailability, driver), race.startTime || '19:30', t)
    const pace = race.driverPace?.find(entry => entry.driver === driver)
    const raceLap = race.avgLapTime ? formatLapTime(race.avgLapTime) : '-'
    return [
      { label: t('availability'), value: hours ?? t('wholeRace'), inherited: !hours },
      pace?.avgLapTime
        ? { label: t('avgLapTime'), value: formatLapTime(pace.avgLapTime) }
        : { label: t('avgLapTime'), value: t('raceAverage', { value: raceLap }), inherited: true },
      pace?.avgFuelPerLap
        ? { label: t('avgFuelPerLap'), value: `${pace.avgFuelPerLap}%` }
        : { label: t('avgFuelPerLap'), value: t('raceAverage', { value: `${race.avgFuelPerLap || 0}%` }), inherited: true },
    ]
  }

  return (
    <dd>
      <DriverPills>
        {drivers.map(driver => (
          <DriverPill
            key={driver}
            type="button"
            aria-expanded={open === driver}
            aria-controls="driver-details"
            onClick={() => setSelected(open === driver ? null : driver)}
          >
            {driver}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </DriverPill>
        ))}
      </DriverPills>
      {open && (
        <DetailsPanel id="driver-details" role="region" aria-label={open}>
          <DetailsList>
            {details(open).map(({ label, value, inherited }) => (
              <DetailItem key={label}>
                <DetailLabel>{label}</DetailLabel>
                <DetailValue $inherited={inherited}>{value}</DetailValue>
              </DetailItem>
            ))}
          </DetailsList>
          <IconButton onClick={() => onEdit(open)} title={t('editDriver', { driver: open })} icon={EditIcon} size="sm" />
        </DetailsPanel>
      )}
    </dd>
  )
}
