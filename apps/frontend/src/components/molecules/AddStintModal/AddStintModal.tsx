import { useState, useEffect, useRef } from 'react'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { CustomSelect } from 'components/atoms/CustomSelect/CustomSelect'
import { CustomCheckbox } from 'components/atoms/CustomCheckbox/CustomCheckbox'
import { useTranslation } from 'react-i18next'
import { type Stint } from 'types/Schedule'
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
  SliderContainer,
  Slider,
  SliderValue,
  CheckboxGroup,
  InputWithUnit,
  InputUnit,
  InputWithUnitStyle,
  ErrorText,
  FieldHint,
  AutoBadge
} from './AddStintModal.styles'
import { FUEL_RESERVE_LAPS, type FinishFuel } from 'utils/raceTimeline'
import { useToast } from '@/hooks/useToast'

interface AddStintModalProps {
  isOpen: boolean
  insertAfterStint: number
  totalStints: number
  raceId: string
  drivers: string[]
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

export function AddStintModal({ isOpen, insertAfterStint, totalStints, raceId, drivers, avgStintTime, startLap, maxDuration, finishFuel, onStintAdded, onCancel }: AddStintModalProps) {
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
  const runsToFlag = !!finishFuel && durationLimit !== undefined && formData.duration >= durationLimit
  const fuelLimit = runsToFlag && finishFuel ? finishFuel.fuel : 100
  const fuel = Math.min(formData.fuel, fuelLimit)

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
    if (!formData.driver.trim()) {
      newErrors.driver = 'validation.required'
    }
    if (!formData.spotter.trim()) {
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
        driver: formData.driver,
        spotter: formData.spotter,
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

          <FormGroup>
            <Label>{t('driver')}</Label>
            <CustomSelect
              value={formData.driver}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, driver: value }))
                if (errors.driver) setErrors(prev => ({ ...prev, driver: undefined }))
              }}
              options={drivers.map(d => ({ value: d, label: d }))}
            />
            {errors.driver && <ErrorText>{t(errors.driver)}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>{t('spotter')}</Label>
            <CustomSelect
              value={formData.spotter}
              onChange={(value) => {
                setFormData(prev => ({ ...prev, spotter: value }))
                if (errors.spotter) setErrors(prev => ({ ...prev, spotter: undefined }))
              }}
              options={drivers.filter(d => d !== formData.driver).map(d => ({ value: d, label: d }))}
            />
            {errors.spotter && <ErrorText>{t(errors.spotter)}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>{t('fuel')}</Label>
            <SliderContainer>
              <Slider
                type="range"
                min="0"
                max="100"
                step="1"
                value={fuel}
                $limit={fuelLimit}
                aria-valuemax={fuelLimit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  // Up to the limit means "as much as allowed": stays automatic, so a full
                  // tank comes back if the stint no longer runs to the flag.
                  const value = Number(e.target.value)
                  setFormData(prev => ({ ...prev, fuel: value >= fuelLimit ? 100 : value }))
                }}
              />
              <SliderValue>{fuel}%</SliderValue>
            </SliderContainer>
            {runsToFlag && finishFuel && (
              <AutoBadge role="status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
                </svg>
                {t('fuelToFinish', { laps: finishFuel.laps, reserve: FUEL_RESERVE_LAPS, fuel: finishFuel.fuel })}
              </AutoBadge>
            )}
          </FormGroup>

          <FormGroup>
            <Label>{t('tiresToChange')}</Label>
            <CustomCheckbox
              checked={formData.tireFL !== '-' && formData.tireFR !== '-' && formData.tireRL !== '-' && formData.tireRR !== '-'}
              onChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                tireFL: checked ? 'N' : '-',
                tireFR: checked ? 'N' : '-',
                tireRL: checked ? 'N' : '-',
                tireRR: checked ? 'N' : '-'
              }))}
              label={t('selectAll')}
            />
            <CheckboxGroup>
              <CustomCheckbox
                checked={formData.tireFL !== '-'}
                onChange={(checked) => setFormData(prev => ({ ...prev, tireFL: checked ? 'N' : '-' }))}
                label="FL"
              />
              <CustomCheckbox
                checked={formData.tireFR !== '-'}
                onChange={(checked) => setFormData(prev => ({ ...prev, tireFR: checked ? 'N' : '-' }))}
                label="FR"
              />
              <CustomCheckbox
                checked={formData.tireRL !== '-'}
                onChange={(checked) => setFormData(prev => ({ ...prev, tireRL: checked ? 'N' : '-' }))}
                label="RL"
              />
              <CustomCheckbox
                checked={formData.tireRR !== '-'}
                onChange={(checked) => setFormData(prev => ({ ...prev, tireRR: checked ? 'N' : '-' }))}
                label="RR"
              />
            </CheckboxGroup>
          </FormGroup>

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
