import { useState, useEffect, useRef } from 'react'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useTranslation } from 'react-i18next'
import { type Stint } from 'types/Schedule'
import { type DriverAvailability } from 'types/Race'
import { stintCrew, type StintCrew } from 'utils/crew'
import { StintCrewFields } from 'components/molecules/StintCrewFields/StintCrewFields'
import {
  Overlay,
  ModalContent,
  ModalTitle,
  Form,
  FormGroup,
  Label,
  ModalButtons,
  InputWithUnit,
  InputUnit,
  InputWithUnitStyle,
  ErrorText,
  FieldHint
} from './EditStintModal.styles'
import { type FinishFuel } from 'utils/raceTimeline'
import { FuelField } from 'components/molecules/FuelField/FuelField'
import { TireField } from 'components/molecules/TireField/TireField'
import { RepairField } from 'components/molecules/RepairField/RepairField'
import { PaceFields } from 'components/molecules/PaceFields/PaceFields'
import { driverPace, paceInput, parsePaceInput, stintPace, validatePaceInput, type Pace, type PaceInputErrors, type RacePace } from 'utils/pace'

interface EditStintModalProps {
  isOpen: boolean
  stint: Stint
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
  // Race and driver pace an empty pace field falls back to.
  racePace: RacePace
  // For the stint driven at a pace: the longest duration that keeps it within the race
  // (minutes; null when unlimited) and its fuel if it drives on to the flag.
  limitsFor: (pace: Pace) => { maxDuration: number | null; finishFuel: FinishFuel | null }
  onConfirm: (updatedStint: Partial<Stint>) => void
  onCancel: () => void
}

interface FormErrors extends PaceInputErrors {
  duration?: string
  driver?: string
  spotter?: string
}

function getInitialFormData(stint: Stint, avgStintTime: number) {
  return {
    duration: stint.duration || avgStintTime,
    fuel: stint.fuel || 100,
    driver: stint.driver || '',
    spotter: stint.spotter || '',
    tireFL: stint.tireFL || '-',
    tireFR: stint.tireFR || '-',
    tireRL: stint.tireRL || '-',
    tireRR: stint.tireRR || '-',
    repairs: stint.repairs ?? [],
    pace: paceInput(stint)
  }
}

function validateForm(formData: ReturnType<typeof getInitialFormData>, crew: StintCrew, maxDuration: number | null): FormErrors {
  const errors: FormErrors = {}

  if (!formData.duration || formData.duration < 0 || formData.duration > 120) {
    errors.duration = 'validation.stintTimeRange'
  } else if (maxDuration !== null && formData.duration > maxDuration) {
    errors.duration = 'validation.beyondRaceEnd'
  }

  if (!crew.driver) {
    errors.driver = 'validation.required'
  }

  if (!crew.spotter) {
    errors.spotter = 'validation.required'
  }

  return { ...errors, ...validatePaceInput(formData.pace) }
}

export function EditStintModal({ isOpen, stint, drivers, driverAvailability, eventDate, eventStartClock, raceStartClock, stintStart, flagAt, avgStintTime, startLap, racePace, limitsFor, onConfirm, onCancel }: EditStintModalProps) {
  const { t } = useTranslation('raceDetails')
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [formData, setFormData] = useState(getInitialFormData(stint, avgStintTime))
  const [errors, setErrors] = useState<FormErrors>({})
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
  // Pace: the stint's own, else its driver's, else the race's. It moves the flag and the
  // fuel needed to reach it.
  const paceOverride = parsePaceInput(formData.pace)
  const pace = stintPace(racePace, { driver: crew.driver, ...paceOverride })
  const { maxDuration, finishFuel } = limitsFor(pace)
  const durationLimit = maxDuration !== null && maxDuration < 120 ? maxDuration : null
  // While the stint runs to the flag, its fuel is capped at what it needs to get there.
  const runsToFlag = !!finishFuel && formData.duration > finishFuel.minDuration
  const activeFinishFuel = runsToFlag ? finishFuel : null
  const fuel = Math.min(formData.fuel, activeFinishFuel ? activeFinishFuel.fuel : 100)

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

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Number(e.target.value)
    setFormData(prev => ({ ...prev, duration: newDuration }))
    if (errors.duration) setErrors(prev => ({ ...prev, duration: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formErrors = validateForm(formData, crew, durationLimit)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      return
    }

    // Stints saved before durationAuto existed count as automatic when they match the average.
    const wasAuto = stint.durationAuto ?? stint.duration === avgStintTime
    // Any manual change of the duration detaches the stint from the average.
    const durationAuto = wasAuto && formData.duration === stint.duration

    onConfirm({
      duration: formData.duration,
      durationAuto,
      fuelLaps: startLap,
      fuel,
      ...paceOverride,
      driver: crew.driver,
      spotter: crew.spotter,
      tireFL: formData.tireFL,
      tireFR: formData.tireFR,
      tireRL: formData.tireRL,
      tireRR: formData.tireRR,
      repairs: formData.repairs
    })
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{t('editStint')}</ModalTitle>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{t('duration')}</Label>
            <InputWithUnit>
              <InputWithUnitStyle
                type="number"
                min="0"
                max="120"
                value={formData.duration || ''}
                onChange={handleDurationChange}
              />
              <InputUnit>min</InputUnit>
            </InputWithUnit>
            {errors.duration && <ErrorText>{t(errors.duration, { max: durationLimit })}</ErrorText>}
            {!errors.duration && durationLimit !== null && <FieldHint>{t('untilFlag', { max: durationLimit })}</FieldHint>}
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

          <PaceFields
            value={formData.pace}
            inherited={driverPace(racePace, crew.driver)}
            errors={errors}
            onChange={(pace) => {
              setFormData(prev => ({ ...prev, pace }))
              setErrors(prev => ({ ...prev, avgLapTime: undefined, avgFuelPerLap: undefined }))
            }}
          />

          <TireField
            value={formData}
            onChange={(tires) => setFormData(prev => ({ ...prev, ...tires }))}
          />

          {/* The first stint starts from the grid: there is no pit stop to repair at. */}
          {stint.order > 1 && (
            <RepairField
              value={formData.repairs}
              onChange={(repairs) => setFormData(prev => ({ ...prev, repairs }))}
            />
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
