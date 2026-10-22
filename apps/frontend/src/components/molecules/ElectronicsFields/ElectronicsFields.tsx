import { useTranslation } from 'react-i18next'
import { CustomSelect } from 'components/atoms/CustomSelect/CustomSelect'
import {
  BRAKE_BIAS_DEFAULT,
  BRAKE_BIAS_MAX,
  BRAKE_BIAS_MIN,
  ELECTRONICS_LEVELS,
  isValidRearWing,
  LEVEL_MAX,
  LEVEL_MIN,
  parseBrakeBias,
  parseRearWing,
  REAR_WING_DEFAULT,
  REAR_WING_MAX,
  REAR_WING_MIN,
  stepBrakeBias,
  stepRearWing,
  type ElectronicsInput,
  type ElectronicsInputErrors
} from 'utils/electronics'
import {
  FormGroup,
  Label,
  InputWithUnit,
  InputUnit,
  InputWithUnitStyle,
  ErrorText,
  FieldHint
} from 'components/molecules/Modal/Modal.styles'
import { LevelsGrid, BiasRow, BiasStep } from './ElectronicsFields.styles'

interface ElectronicsFieldsProps {
  value: ElectronicsInput
  errors: ElectronicsInputErrors
  onChange: (value: ElectronicsInput) => void
}

const levelOptions = (notSet: string) => [
  { value: '', label: notSet },
  ...Array.from({ length: LEVEL_MAX - LEVEL_MIN + 1 }, (_, i) => String(LEVEL_MIN + i)).map(level => ({ value: level, label: level })),
]

// A driver's ABS, traction control (slip, power cut) levels, brake bias and rear wing; all optional.
export function ElectronicsFields({ value, errors, onChange }: ElectronicsFieldsProps) {
  const { t } = useTranslation('raceDetails')
  const options = levelOptions('-')
  const front = parseBrakeBias(value.brakeBias)
  const inRange = front !== null && front >= BRAKE_BIAS_MIN && front <= BRAKE_BIAS_MAX
  // The buttons start from the default when nothing is typed yet.
  const step = (steps: number) =>
    onChange({ ...value, brakeBias: stepBrakeBias(inRange ? front : BRAKE_BIAS_DEFAULT, steps).toFixed(1) })
  const wing = parseRearWing(value.rearWing)
  const wingValid = isValidRearWing(wing)
  const stepWing = (steps: number) =>
    onChange({ ...value, rearWing: stepRearWing(wingValid ? wing : REAR_WING_DEFAULT, steps).toFixed(1) })

  return (
    <>
      <LevelsGrid>
        {ELECTRONICS_LEVELS.map(level => (
          <FormGroup key={level} style={{ minWidth: 0 }}>
            <Label as="span">{t(`electronics.${level}`)}</Label>
            <CustomSelect value={value[level]} onChange={(v) => onChange({ ...value, [level]: v })} options={options} />
          </FormGroup>
        ))}
      </LevelsGrid>
      <FormGroup>
        <Label htmlFor="driver-brake-bias">{t('electronics.brakeBias')}</Label>
        {/* Front on the left, rear on the right, like the "front:rear" value between them. */}
        <BiasRow>
          <BiasStep type="button" onClick={() => step(1)} disabled={inRange && front >= BRAKE_BIAS_MAX} title={t('brakeBiasForward')}>
            ◀ {t('brakeBiasFront')}
          </BiasStep>
          <InputWithUnit>
            <InputWithUnitStyle
              id="driver-brake-bias"
              type="text"
              inputMode="decimal"
              value={value.brakeBias}
              onChange={(e) => onChange({ ...value, brakeBias: e.target.value })}
              placeholder={BRAKE_BIAS_DEFAULT.toFixed(1)}
              aria-invalid={!!errors.brakeBias}
              aria-describedby="driver-brake-bias-hint"
              style={{ paddingRight: '4.5rem' }}
            />
            <InputUnit>:{(100 - (inRange ? front : BRAKE_BIAS_DEFAULT)).toFixed(1)}</InputUnit>
          </InputWithUnit>
          <BiasStep type="button" onClick={() => step(-1)} disabled={inRange && front <= BRAKE_BIAS_MIN} title={t('brakeBiasRearward')}>
            {t('brakeBiasRear')} ▶
          </BiasStep>
        </BiasRow>
        {errors.brakeBias && <ErrorText>{t(errors.brakeBias, { min: BRAKE_BIAS_MIN, max: BRAKE_BIAS_MAX })}</ErrorText>}
        <FieldHint id="driver-brake-bias-hint">{t('brakeBiasHint')}</FieldHint>
      </FormGroup>
      <FormGroup>
        <Label htmlFor="driver-rear-wing">{t('electronics.rearWing')}</Label>
        <BiasRow>
          <BiasStep type="button" onClick={() => stepWing(-1)} disabled={wingValid && wing <= REAR_WING_MIN} title={t('rearWingLess')}>
            − {t('rearWingLower')}
          </BiasStep>
          <InputWithUnit>
            <InputWithUnitStyle
              id="driver-rear-wing"
              type="text"
              inputMode="decimal"
              value={value.rearWing}
              onChange={(e) => onChange({ ...value, rearWing: e.target.value })}
              placeholder={REAR_WING_DEFAULT.toFixed(1)}
              aria-invalid={!!errors.rearWing}
              aria-describedby="driver-rear-wing-hint"
            />
            <InputUnit>°</InputUnit>
          </InputWithUnit>
          <BiasStep type="button" onClick={() => stepWing(1)} disabled={wingValid && wing >= REAR_WING_MAX} title={t('rearWingMore')}>
            {t('rearWingHigher')} +
          </BiasStep>
        </BiasRow>
        {errors.rearWing && <ErrorText>{t(errors.rearWing, { min: REAR_WING_MIN, max: REAR_WING_MAX })}</ErrorText>}
        <FieldHint id="driver-rear-wing-hint">{t('rearWingHint')}</FieldHint>
      </FormGroup>
    </>
  )
}
