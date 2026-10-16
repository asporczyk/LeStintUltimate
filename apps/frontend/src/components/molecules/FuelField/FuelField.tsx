import { useTranslation } from 'react-i18next'
import { FUEL_RESERVE_LAPS, type FinishFuel } from 'utils/raceTimeline'
import { FormGroup, Label, SliderContainer, Slider, SliderValue, AutoBadge } from 'components/molecules/Modal/Modal.styles'

interface FuelFieldProps {
  // Fuel as stored in the form: 100 also stands for "as much as allowed".
  value: number
  onChange: (value: number) => void
  // Set when the stint drives on to the flag: fuel is capped at what it needs.
  finishFuel: FinishFuel | null
}

// Refuel slider. For the stint that runs to the flag it offers only the fuel for the laps
// left plus a reserve, and blocks anything above that.
export function FuelField({ value, onChange, finishFuel }: FuelFieldProps) {
  const { t } = useTranslation('raceDetails')
  const limit = finishFuel ? finishFuel.fuel : 100
  const fuel = Math.min(value, limit)

  return (
    <FormGroup>
      <Label>{t('fuel')}</Label>
      <SliderContainer>
        <Slider
          type="range"
          min="0"
          max="100"
          step="1"
          value={fuel}
          $limit={limit}
          aria-label={t('fuel')}
          aria-valuemax={limit}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Up to the limit means "as much as allowed": stays automatic, so a full
            // tank comes back if the stint no longer runs to the flag.
            const next = Number(e.target.value)
            onChange(next >= limit ? 100 : next)
          }}
        />
        <SliderValue>{fuel}%</SliderValue>
      </SliderContainer>
      {finishFuel && (
        <AutoBadge role="status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
          </svg>
          {t('fuelToFinish', { laps: finishFuel.laps, reserve: FUEL_RESERVE_LAPS })}
        </AutoBadge>
      )}
    </FormGroup>
  )
}

