import { useState, useEffect, useRef } from 'react'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useTranslation } from 'react-i18next'
import { type Stint } from 'types/Schedule'
import { type DriverAvailability } from 'types/Race'
import { stintCrew } from 'utils/crew'
import { StintCrewFields } from 'components/molecules/StintCrewFields/StintCrewFields'
import { StintsApi } from 'api/StintsApi'
import {
  Overlay,
  ModalContent,
  ModalTitle,
  ModalText,
  ModalButtons,
  Form,
  FormGroup,
  Label,
  InputWithUnit,
  InputUnit,
  InputWithUnitStyle,
  ErrorText,
  FieldHint
} from './AddStintModal.styles'
import { type FinishFuel } from 'utils/raceTimeline'
import { FuelField } from 'components/molecules/FuelField/FuelField'
import { TireField } from 'components/molecules/TireField/TireField'
import { useToast } from '@/hooks/useToast'

interface AddStintModalProps {
  isOpen: boolean
  insertAfterStint: number
  totalStints: number
  raceId: string
  drivers: string[]
  driverAvailability?: DriverAvailability[]
  // Event date and start, race start clock, and the stint's start and the checkered flag in race minutes, to
  // offer only the drivers available at the stint's time.
  eventDate: string | Date
  eventStartClock: string
  raceStartClock: string
  stintStart: number
  flagAt: number
  avgStintTime: number
  startLap: number
  // Longest stint that still ends by the checkered flag (minutes).
  maxDuration?: number
  // Fuel for a stint added at the end that drives on to the flag.
  finishFuel?: FinishFuel | null
  onStintAdded: (stint: Stint) => void
  onCancel: () => void
}

function getInitialFormData(avgStintTime: number) {
  return {
    duration: avgStintTime,
    fuel: 100,
    driver: '',
    spotter: '',
    tireFL: '-',
    tireFR: '-',
    tireRL: '-',
    tireRR: '-'
  }
}

interface FormErrors {
  duration?: string
  driver?: string
  spotter?: string
}

export function AddStintModal({ isOpen, insertAfterStint, totalStints, raceId, drivers, driverAvailability, eventDate, eventStartClock, raceStartClock, stintStart, flagAt, avgStintTime, startLap, maxDuration, finishFuel, onStintAdded, onCancel }: AddStintModalProps) {
  const { t } = useTranslation('raceDetails')
  const { showError } = useToast()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const durationLimit = maxDuration !== undefined && maxDuration < 120 ? maxDuration : undefined
  // The average stint time, or less when the race ends sooner.
  const [formData, setFormData] = useState(getInitialFormData(
    durationLimit !== undefined ? Math.min(avgStintTime, durationLimit) : avgStintTime
  ))
  const [errors, setErrors] = useState<FormErrors>({})
  // A stint that runs to the flag needs only the fuel for the laps left (plus a reserve),
  // so the fuel is capped there; a shorter duration lifts the cap again.
  const runsToFlag = !!finishFuel && formData.duration > finishFuel.minDuration
  const activeFinishFuel = runsToFlag ? finishFuel ?? null : null
  const fuel = Math.min(formData.fuel, activeFinishFuel ? activeFinishFuel.fuel : 100)
  const crew = stintCrew({
    drivers,
    availability: driverAvailability,
    eventDate,
    eventStartClock,
    raceStartClock,
    start: stintStart,
    end: Math.min(stintStart + Math.max(0, formData.duration || 0), flagAt),
    driver: formData.driver,
    spotter: formData.spotter,
  })

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.duration || formData.duration < 0 || formData.duration > 120) {
      newErrors.duration = 'validation.stintTimeRange'
    } else if (durationLimit !== undefined && formData.duration > durationLimit) {
      newErrors.duration = 'validation.beyondRaceEnd'
    }
    if (!crew.driver) {
      newErrors.driver = 'validation.required'
    }
    if (!crew.spotter) {
      newErrors.spotter = 'validation.required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {

      const newStint = await StintsApi.create({
        raceId,
        order: insertAfterStint + 1,
        duration: formData.duration,
        // Follows the race's average stint time while it is left at the prefilled value.
        durationAuto: formData.duration === avgStintTime,
        driver: crew.driver,
        spotter: crew.spotter,
        fuelLaps: startLap,
        fuel,
        tireFL: formData.tireFL,
        tireFR: formData.tireFR,
        tireRL: formData.tireRL,
        tireRR: formData.tireRR
      })
      onStintAdded(newStint)
      onCancel()
    } catch (err) {
      console.error('Failed to add stint', err)
      showError(t('save-failed', { ns: 'common' }))
    }
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Number(e.target.value)
    setFormData(prev => ({ ...prev, duration: newDuration }))
    if (errors.duration) setErrors(prev => ({ ...prev, duration: undefined }))
  }

  const isLastStint = insertAfterStint === totalStints
  const message = isLastStint 
    ? t('insertAfter', { after: insertAfterStint })
    : t('insertBetween', { after: insertAfterStint, before: insertAfterStint + 1 })

  if (!isOpen) return null

  return (
    <Overlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{t('addStint')}</ModalTitle>
        <ModalText style={{ marginBottom: '16px' }}>{message}</ModalText>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{t('duration')}</Label>
            <InputWithUnit>
              <InputWithUnitStyle
                type="number"
                min="0"
                max="120"
                value={formData.duration}
                onChange={handleDurationChange}
              />
              <InputUnit>min</InputUnit>
            </InputWithUnit>
            {errors.duration && <ErrorText>{t(errors.duration, { max: durationLimit })}</ErrorText>}
            {!errors.duration && durationLimit !== undefined && <FieldHint>{t('untilFlag', { max: durationLimit })}</FieldHint>}
          </FormGroup>

          <FormGroup>
            <Label>{t('startLap')}</Label>
            <InputWithUnit>
              <InputWithUnitStyle
                type="number"
                value={startLap}
                disabled
              />
            </InputWithUnit>
          </FormGroup>

          <StintCrewFields
            crew={crew}
            errors={errors}
            onDriverChange={(value) => {
              setFormData(prev => ({ ...prev, driver: value }))
              if (errors.driver) setErrors(prev => ({ ...prev, driver: undefined }))
            }}
            onSpotterChange={(value) => {
              setFormData(prev => ({ ...prev, spotter: value }))
              if (errors.spotter) setErrors(prev => ({ ...prev, spotter: undefined }))
            }}
          />

          <FuelField
            value={formData.fuel}
            onChange={(value) => setFormData(prev => ({ ...prev, fuel: value }))}
            finishFuel={activeFinishFuel}
          />

          <TireField
            value={formData}
            onChange={(tires) => setFormData(prev => ({ ...prev, ...tires }))}
          />

          <ModalButtons>
            <TextButton type="button" $variant="secondary" ref={cancelRef} onClick={onCancel}>
              {t('cancel')}
            </TextButton>
            <TextButton type="submit">
              {t('add')}
            </TextButton>
          </ModalButtons>
        </Form>
      </ModalContent>
    </Overlay>
  )
}
