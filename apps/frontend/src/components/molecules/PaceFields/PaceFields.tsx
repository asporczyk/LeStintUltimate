import { useTranslation } from 'react-i18next'
import { type Pace, type PaceInput, type PaceInputErrors } from 'utils/pace'
import { formatLapTime } from 'utils/time'
import {
  FormRow,
  FormGroup,
  Label,
  InputWithUnit,
  InputUnit,
  InputWithUnitStyle,
  ErrorText,
  FieldHint
} from 'components/molecules/Modal/Modal.styles'

interface PaceFieldsProps {
  value: PaceInput
  // What an empty field stands for: the driver's pace, else the race's.
  inherited: Pace
  errors: PaceInputErrors
  onChange: (value: PaceInput) => void
  // What an empty field means; the stint's wording by default.
  hint?: string
}

// Optional lap time and fuel use (of a stint or a driver). Empty fields show the inherited values.
export function PaceFields({ value, inherited, errors, onChange, hint }: PaceFieldsProps) {
  const { t } = useTranslation('raceDetails')
  const set = (field: keyof PaceInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [field]: e.target.value })

  return (
    <div>
      <FormRow>
        <FormGroup>
          <Label htmlFor="stint-avg-lap-time">{t('avgLapTime')}</Label>
          <InputWithUnit>
            <InputWithUnitStyle
              id="stint-avg-lap-time"
              type="text"
              value={value.avgLapTime}
              onChange={set('avgLapTime')}
              placeholder={inherited.avgLapTime ? formatLapTime(inherited.avgLapTime) : '1:35:000'}
              aria-invalid={!!errors.avgLapTime}
            />
          </InputWithUnit>
          {errors.avgLapTime && <ErrorText>{t(errors.avgLapTime)}</ErrorText>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="stint-avg-fuel">{t('avgFuelPerLap')}</Label>
          <InputWithUnit>
            <InputWithUnitStyle
              id="stint-avg-fuel"
              type="number"
              value={value.avgFuelPerLap}
              onChange={set('avgFuelPerLap')}
              placeholder={inherited.avgFuelPerLap ? String(inherited.avgFuelPerLap) : '4.5'}
              min="0"
              max="100"
              step="0.01"
              aria-invalid={!!errors.avgFuelPerLap}
            />
            <InputUnit>%</InputUnit>
          </InputWithUnit>
          {errors.avgFuelPerLap && <ErrorText>{t(errors.avgFuelPerLap)}</ErrorText>}
        </FormGroup>
      </FormRow>
      <FieldHint>{hint ?? t('stintPaceHint')}</FieldHint>
    </div>
  )
}
