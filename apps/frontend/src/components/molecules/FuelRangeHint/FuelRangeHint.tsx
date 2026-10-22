import { useTranslation } from 'react-i18next'
import { FieldHint, FieldWarning } from 'components/molecules/Modal/Modal.styles'
import { FUEL_RESERVE_LAPS, fuelRange } from 'utils/raceTimeline'
import { type Pace } from 'utils/pace'

interface FuelRangeHintProps {
  duration: number
  fuel: number
  pace: Pace
}

// Under the stint duration: how long the stint's fuel lasts, with a lap in reserve. A
// longer duration is only a warning, the plan may still change the fuel or pace.
export function FuelRangeHint({ duration, fuel, pace }: FuelRangeHintProps) {
  const { t } = useTranslation('raceDetails')
  const range = fuelRange(fuel, pace.avgFuelPerLap, pace.avgLapTime)
  if (!range) return null
  const values = { max: range.minutes, laps: range.laps, reserve: FUEL_RESERVE_LAPS }
  return duration > range.minutes
    ? <FieldWarning>{t('fuelRangeExceeded', values)}</FieldWarning>
    : <FieldHint>{t('fuelRange', values)}</FieldHint>
}
