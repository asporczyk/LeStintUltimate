import { useState, useEffect, useRef } from 'react'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useTranslation } from 'react-i18next'
import { type Race, type DriverAvailability } from 'types/Race'
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
  FieldHint,
  InputWithUnit,
  InputUnit,
  InputWithUnitStyle
} from './EditRaceModal.styles'
import { DriverChips } from './DriverChips'
import { DriverAvailabilityFields } from './DriverAvailabilityFields'
import { formatLapTime, parseLapTime } from 'utils/time'

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
    driverAvailability: (race.driverAvailability || []) as DriverAvailability[]
  }
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

  // Parent remounts the modal (key) each time it opens, so state starts fresh.
  useEffect(() => {
    if (isOpen) cancelRef.current?.focus()
  }, [isOpen])

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
      // Only drivers still in the race, and only those with hours set.
      driverAvailability: formData.driverAvailability
        .filter(entry => formData.drivers.includes(entry.driver) && (entry.from || entry.to))
        .map(({ driver, from, to }) => ({ driver, from: from || '', to: to || '' }))
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

  const handleAvailabilityChange = (driverAvailability: DriverAvailability[]) => {
    setFormData(prev => ({ ...prev, driverAvailability }))
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onCancel}>
      <ModalContent $width="560px" onClick={(e) => e.stopPropagation()}>
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

          {formData.drivers.length > 0 && (
            <FormGroup>
              <Label as="span">{t('driverAvailability')}</Label>
              <FieldHint>{t('driverAvailabilityHint')}</FieldHint>
              <DriverAvailabilityFields
                drivers={formData.drivers}
                availability={formData.driverAvailability}
                onChange={handleAvailabilityChange}
              />
            </FormGroup>
          )}

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
