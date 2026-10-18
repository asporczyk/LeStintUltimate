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
  FieldHint,
  InputWithUnit,
  InputUnit,
  InputWithUnitStyle
} from './EditRaceModal.styles'
import { DriverChips } from './DriverChips'
import { formatLapTime, parseLapTime } from 'utils/time'
import { DEFAULT_PIT_LANE_TIME } from 'utils/pitstop'
import { DatePicker } from 'components/atoms/Picker/DatePicker'
import { TimeSelect } from 'components/atoms/Picker/TimeSelect'

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
  pitLaneTime?: string
  avgLapTime?: string
  avgFuelPerLap?: string
  avgStintTime?: string
  drivers?: string
}

// Today as "YYYY-MM-DD" in local time.
const todayValue = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

// Start times every 15 minutes, plus a saved time off that grid.
function startTimeOptions(current: string) {
  const times = Array.from({ length: 96 }, (_, i) =>
    `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`)
  if (current && !times.includes(current)) times.push(current)
  return times.sort().map(time => ({ value: time, label: time }))
}

function getInitialFormData(race: Race) {
  return {
    name: race.name || '',
    startDate: race.startDate ? new Date(race.startDate).toISOString().split('T')[0] : '',
    startTime: race.startTime || '19:30',
    raceLength: race.raceLength?.toString() || '',
    tireSets: race.tireSets?.toString() || '',
    fuelTankCapacity: race.fuelTankCapacity?.toString() || '',
    pitLaneTime: (race.pitLaneTime ?? DEFAULT_PIT_LANE_TIME).toString(),
    avgLapTime: race.avgLapTime ? formatLapTime(race.avgLapTime) : '',
    avgFuelPerLap: race.avgFuelPerLap?.toString() || '',
    avgStintTime: race.avgStintTime?.toString() || '',
    drivers: race.drivers || []
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

  if (!formData.pitLaneTime.trim()) {
    errors.pitLaneTime = 'validation.required'
  } else if (Number(formData.pitLaneTime) < 0 || Number(formData.pitLaneTime) > 300) {
    errors.pitLaneTime = 'validation.pitLaneTimeRange'
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
      pitLaneTime: Number(formData.pitLaneTime),
      avgLapTime: lapTime ?? undefined,
      avgFuelPerLap: Number(formData.avgFuelPerLap),
      avgStintTime: Number(formData.avgStintTime),
      drivers: formData.drivers,
      // Settings of removed drivers go with them (set per driver on the race page).
      driverAvailability: (race.driverAvailability || []).filter(entry => formData.drivers.includes(entry.driver)),
      driverPace: (race.driverPace || []).filter(entry => formData.drivers.includes(entry.driver)),
      driverElectronics: (race.driverElectronics || []).filter(entry => formData.drivers.includes(entry.driver))
    })
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const setField = (field: 'startDate' | 'startTime', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
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
              <DatePicker
                value={formData.startDate}
                onChange={value => setField('startDate', value)}
                min={todayValue()}
                ariaLabel={t('startDate')}
              />
              {errors.startDate && <ErrorText>{t(errors.startDate)}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>{t('startTime')}</Label>
              <TimeSelect
                value={formData.startTime}
                onChange={value => setField('startTime', value)}
                groups={[{ label: '', options: startTimeOptions(formData.startTime) }]}
                ariaLabel={t('startTime')}
              />
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
                  step="0.01"
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

            <FormGroup>
              <Label>{t('pitLaneTime')}</Label>
              <InputWithUnit>
                <InputWithUnitStyle
                  type="number"
                  value={formData.pitLaneTime}
                  onChange={handleChange('pitLaneTime')}
                  placeholder={String(DEFAULT_PIT_LANE_TIME)}
                  min="0"
                  max="300"
                  step="0.1"
                />
                <InputUnit>s</InputUnit>
              </InputWithUnit>
              <FieldHint>{t('pitLaneTimeHint')}</FieldHint>
              {errors.pitLaneTime && <ErrorText>{t(errors.pitLaneTime)}</ErrorText>}
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
