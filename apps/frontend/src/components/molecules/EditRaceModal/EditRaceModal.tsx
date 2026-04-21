import { useState, useEffect, useRef } from 'react'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useTranslation } from 'react-i18next'
import { type Race } from 'types/Race'
import {
  Overlay,
  ModalContent,
  ModalTitle,
  Form,
  FormRow,
  FormGroup,
  Label,
  ModalButtons,
  ErrorText,
  InputWithUnit,
  InputUnit,
  InputWithUnitStyle
} from './EditRaceModal.styles'
import { DriverChips } from './DriverChips'

interface EditRaceModalProps {
  isOpen: boolean
  race: Race
  onConfirm: (updatedRace: Partial<Race>) => void
  onCancel: () => void
}

interface FormErrors {
  name?: string
  startDate?: string
  startTime?: string
  raceLength?: string
  tireSets?: string
  fuelTankCapacity?: string
  avgLapTime?: string
  avgFuelPerLap?: string
  avgStintTime?: string
  drivers?: string
}

function getInitialFormData(race: Race) {
  return {
    name: race.name || '',
    startDate: race.startDate ? new Date(race.startDate).toISOString().split('T')[0] : '',
    startTime: race.startTime || '19:30',
    raceLength: race.raceLength?.toString() || '',
    tireSets: race.tireSets?.toString() || '',
    fuelTankCapacity: race.fuelTankCapacity?.toString() || '',
    avgLapTime: race.avgLapTime ? formatLapTime(race.avgLapTime) : '',
    avgFuelPerLap: race.avgFuelPerLap?.toString() || '',
    avgStintTime: race.avgStintTime?.toString() || '',
    drivers: race.drivers || [],
    qualificationStartTime: race.qualification?.startTime || race.startTime || '14:00',
    qualificationDuration: race.qualification?.duration?.toString() || '30',
    qualificationLaps: race.qualification?.laps?.toString() || '',
    qualificationDriver: race.qualification?.driver || '',
    qualificationSpotter: race.qualification?.spotter || '',
    qualificationFuel: race.qualification?.fuel?.toString() || '100',
    qualificationTireFL: race.qualification?.tireFL || '-',
    qualificationTireFR: race.qualification?.tireFR || '-',
    qualificationTireRL: race.qualification?.tireRL || '-',
    qualificationTireRR: race.qualification?.tireRR || '-'
  }
}

function formatLapTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`
}

function parseLapTime(value: string): number | null {
  const match = value.match(/^(\d+):(\d{1,2}):(\d{1,3})$/)
  if (!match) return null
  const mins = parseInt(match[1], 10)
  const secs = parseInt(match[2], 10)
  const ms = parseInt(match[3].padEnd(3, '0'), 10)
  if (secs >= 60) return null
  return mins * 60 + secs + ms / 1000
}

function validateForm(formData: ReturnType<typeof getInitialFormData>): FormErrors {
  const errors: FormErrors = {}

  if (!formData.name.trim()) {
    errors.name = 'validation.required'
  } else if (formData.name.length > 100) {
    errors.name = 'validation.nameTooLong'
  }

  if (!formData.startDate) {
    errors.startDate = 'validation.required'
  } else {
    const selectedDate = new Date(formData.startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      errors.startDate = 'validation.futureDate'
    }
  }

  if (!formData.raceLength.trim()) {
    errors.raceLength = 'validation.required'
  } else if (Number(formData.raceLength) <= 0) {
    errors.raceLength = 'validation.positiveNumber'
  } else if (Number(formData.raceLength) > 24) {
    errors.raceLength = 'validation.raceLengthRange'
  }

  if (!formData.tireSets.trim()) {
    errors.tireSets = 'validation.required'
  } else if (Number(formData.tireSets) < 0) {
    errors.tireSets = 'validation.nonNegativeNumber'
  } else if (Number(formData.tireSets) > 100) {
    errors.tireSets = 'validation.tireSetsRange'
  }

  if (!formData.fuelTankCapacity.trim()) {
    errors.fuelTankCapacity = 'validation.required'
  } else if (Number(formData.fuelTankCapacity) <= 0) {
    errors.fuelTankCapacity = 'validation.positiveNumber'
  }

  if (!formData.avgLapTime.trim()) {
    errors.avgLapTime = 'validation.required'
  } else if (parseLapTime(formData.avgLapTime) === null) {
    errors.avgLapTime = 'validation.lapTimeFormat'
  }

  if (!formData.avgFuelPerLap.trim()) {
    errors.avgFuelPerLap = 'validation.required'
  } else if (Number(formData.avgFuelPerLap) < 0 || Number(formData.avgFuelPerLap) > 100) {
    errors.avgFuelPerLap = 'validation.fuelPercentRange'
  }

  if (!formData.avgStintTime.trim()) {
    errors.avgStintTime = 'validation.required'
  } else if (Number(formData.avgStintTime) < 0) {
    errors.avgStintTime = 'validation.nonNegativeNumber'
  } else if (Number(formData.avgStintTime) > 120) {
    errors.avgStintTime = 'validation.stintTimeRange'
  }

  if (!formData.drivers || formData.drivers.length === 0) {
    errors.drivers = 'validation.required'
  } else if (formData.drivers.some(d => d.length > 50)) {
    errors.drivers = 'validation.driverNameTooLong'
  }

  return errors
}

export function EditRaceModal({ isOpen, race, onConfirm, onCancel }: EditRaceModalProps) {
  const { t } = useTranslation('raceDetails')
  const cancelRef = useRef<HTMLButtonElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState(getInitialFormData(race))
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(getInitialFormData(race))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrors({})
    }
  }, [isOpen, race])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formErrors = validateForm(formData)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      return
    }

    const lapTime = parseLapTime(formData.avgLapTime)

    onConfirm({
      name: formData.name.trim(),
      startDate: new Date(formData.startDate),
      startTime: formData.startTime,
      raceLength: Number(formData.raceLength),
      tireSets: Number(formData.tireSets),
      fuelTankCapacity: Number(formData.fuelTankCapacity),
      avgLapTime: lapTime ?? undefined,
      avgFuelPerLap: Number(formData.avgFuelPerLap),
      avgStintTime: Number(formData.avgStintTime),
      drivers: formData.drivers,
      qualification: {
        startTime: formData.qualificationStartTime,
        duration: Number(formData.qualificationDuration),
        laps: Number(formData.qualificationLaps) || 0,
        driver: formData.qualificationDriver,
        spotter: formData.qualificationSpotter,
        fuel: Number(formData.qualificationFuel),
        tireFL: formData.qualificationTireFL || '-',
        tireFR: formData.qualificationTireFR || '-',
        tireRL: formData.qualificationTireRL || '-',
        tireRR: formData.qualificationTireRR || '-'
      }
    })
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleDriversChange = (drivers: string[]) => {
    setFormData(prev => ({ ...prev, drivers }))
    if (errors.drivers) {
      setErrors(prev => ({ ...prev, drivers: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{t('editRace')}</ModalTitle>
        <Form ref={formRef} onSubmit={handleSubmit}>
            <FormGroup>
              <Label>{t('name')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder={t('namePlaceholder')}
                  maxLength={100}
                />
              </InputWithUnit>
              {errors.name && <ErrorText>{t(errors.name)}</ErrorText>}
            </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>{t('startDate')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange('startDate')}
                />
              </InputWithUnit>
              {errors.startDate && <ErrorText>{t(errors.startDate)}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>{t('startTime')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange('startTime')}
                />
              </InputWithUnit>
            </FormGroup>

            <FormGroup>
              <Label>{t('raceLength')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="number"
                  value={formData.raceLength}
                  onChange={handleChange('raceLength')}
                  placeholder="6"
                  min="0"
                  max="24"
                  step="0.1"
                />
                <InputUnit>h</InputUnit>
              </InputWithUnit>
              {errors.raceLength && <ErrorText>{t(errors.raceLength)}</ErrorText>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>{t('tireSets')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="number"
                  value={formData.tireSets}
                  onChange={handleChange('tireSets')}
                  placeholder="30"
                  min="0"
                  max="100"
                />
              </InputWithUnit>
              {errors.tireSets && <ErrorText>{t(errors.tireSets)}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>{t('fuelTankCapacity')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="number"
                  value={formData.fuelTankCapacity}
                  onChange={handleChange('fuelTankCapacity')}
                  placeholder="100"
                  min="1"
                  step="1"
                />
                <InputUnit>L</InputUnit>
              </InputWithUnit>
              {errors.fuelTankCapacity && <ErrorText>{t(errors.fuelTankCapacity)}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>{t('avgLapTime')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="text"
                  value={formData.avgLapTime}
                  onChange={handleChange('avgLapTime')}
                  placeholder="1:35:000"
                />
              </InputWithUnit>
              {errors.avgLapTime && <ErrorText>{t(errors.avgLapTime)}</ErrorText>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>{t('avgFuelPerLap')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="number"
                  value={formData.avgFuelPerLap}
                  onChange={handleChange('avgFuelPerLap')}
                  placeholder="4.5"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <InputUnit>%</InputUnit>
              </InputWithUnit>
              {errors.avgFuelPerLap && <ErrorText>{t(errors.avgFuelPerLap)}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>{t('avgStintTime')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="number"
                  value={formData.avgStintTime}
                  onChange={handleChange('avgStintTime')}
                  placeholder="42"
                  min="0"
                  max="120"
                />
                <InputUnit>min</InputUnit>
              </InputWithUnit>
              {errors.avgStintTime && <ErrorText>{t(errors.avgStintTime)}</ErrorText>}
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>{t('drivers')}</Label>
            <DriverChips
              drivers={formData.drivers}
              onChange={handleDriversChange}
              placeholder={t('driversPlaceholder')}
            />
            {errors.drivers && <ErrorText>{t(errors.drivers)}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>{t('qualificationData')}</Label>
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>{t('qualificationStartTime')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="time"
                  value={formData.qualificationStartTime}
                  onChange={handleChange('qualificationStartTime')}
                />
              </InputWithUnit>
            </FormGroup>

            <FormGroup>
              <Label>{t('qualificationDuration')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="number"
                  value={formData.qualificationDuration}
                  onChange={handleChange('qualificationDuration')}
                  min="1"
                  max="120"
                />
                <InputUnit>min</InputUnit>
              </InputWithUnit>
            </FormGroup>

            <FormGroup>
              <Label>{t('laps')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="number"
                  value={formData.qualificationLaps}
                  onChange={handleChange('qualificationLaps')}
                  min="0"
                />
              </InputWithUnit>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>{t('driver')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="text"
                  value={formData.qualificationDriver}
                  onChange={handleChange('qualificationDriver')}
                  placeholder={t('driverPlaceholder')}
                  maxLength={50}
                />
              </InputWithUnit>
            </FormGroup>

            <FormGroup>
              <Label>{t('spotter')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="text"
                  value={formData.qualificationSpotter}
                  onChange={handleChange('qualificationSpotter')}
                  placeholder={t('spotterPlaceholder')}
                  maxLength={50}
                />
              </InputWithUnit>
            </FormGroup>

            <FormGroup>
              <Label>{t('fuel')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="number"
                  value={formData.qualificationFuel}
                  onChange={handleChange('qualificationFuel')}
                  min="0"
                  max="100"
                />
                <InputUnit>%</InputUnit>
              </InputWithUnit>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>{t('tiresToChange')}</Label>
            <FormRow>
              <FormGroup>
                <Label>FL</Label>
                <InputWithUnit>
                  <InputWithUnitStyle
                    type="text"
                    value={formData.qualificationTireFL}
                    onChange={handleChange('qualificationTireFL')}
                    maxLength={1}
                  />
                </InputWithUnit>
              </FormGroup>
              <FormGroup>
                <Label>FR</Label>
                <InputWithUnit>
                  <InputWithUnitStyle
                    type="text"
                    value={formData.qualificationTireFR}
                    onChange={handleChange('qualificationTireFR')}
                    maxLength={1}
                  />
                </InputWithUnit>
              </FormGroup>
              <FormGroup>
                <Label>RL</Label>
                <InputWithUnit>
                  <InputWithUnitStyle
                    type="text"
                    value={formData.qualificationTireRL}
                    onChange={handleChange('qualificationTireRL')}
                    maxLength={1}
                  />
                </InputWithUnit>
              </FormGroup>
              <FormGroup>
                <Label>RR</Label>
                <InputWithUnit>
                  <InputWithUnitStyle
                    type="text"
                    value={formData.qualificationTireRR}
                    onChange={handleChange('qualificationTireRR')}
                    maxLength={1}
                  />
                </InputWithUnit>
              </FormGroup>
            </FormRow>
          </FormGroup>

          <ModalButtons>
            <TextButton type="button" $variant="secondary" ref={cancelRef} onClick={onCancel}>
              {t('cancel')}
            </TextButton>
            <TextButton type="submit">
              {t('save')}
            </TextButton>
          </ModalButtons>
        </Form>
      </ModalContent>
    </Overlay>
  )
}
