import { useState, useEffect, useRef } from 'react'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { CustomSelect } from 'components/atoms/CustomSelect/CustomSelect'
import { CustomCheckbox } from 'components/atoms/CustomCheckbox/CustomCheckbox'
import { useTranslation } from 'react-i18next'
import { type Stint } from 'types/Schedule'
import {
  Overlay,
  ModalContent,
  ModalTitle,
  Form,
  FormGroup,
  Label,
  ModalButtons,
  CheckboxGroup,
  InputWithUnit,
  InputUnit,
  InputWithUnitStyle,
  ErrorText,
  FieldHint
} from './EditStintModal.styles'
import { type FinishFuel } from 'utils/raceTimeline'
import { FuelField } from 'components/molecules/FuelField/FuelField'

interface EditStintModalProps {
  isOpen: boolean
  stint: Stint
  drivers: string[]
  avgStintTime: number
  startLap: number
  // Longest duration that keeps the stint within the race (minutes); null when unlimited.
  maxDuration?: number | null
  // Fuel for this stint if it drives on to the flag.
  finishFuel?: FinishFuel | null
  onConfirm: (updatedStint: Partial<Stint>) => void
  onCancel: () => void
}

interface FormErrors {
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
    tireRR: stint.tireRR || '-'
  }
}

function validateForm(formData: ReturnType<typeof getInitialFormData>, maxDuration: number | null): FormErrors {
  const errors: FormErrors = {}

  if (!formData.duration || formData.duration < 0 || formData.duration > 120) {
    errors.duration = 'validation.stintTimeRange'
  } else if (maxDuration !== null && formData.duration > maxDuration) {
    errors.duration = 'validation.beyondRaceEnd'
  }

  if (!formData.driver.trim()) {
    errors.driver = 'validation.required'
  }

  if (!formData.spotter.trim()) {
    errors.spotter = 'validation.required'
  }

  return errors
}

export function EditStintModal({ isOpen, stint, drivers, avgStintTime, startLap, maxDuration = null, finishFuel = null, onConfirm, onCancel }: EditStintModalProps) {
  const { t } = useTranslation('raceDetails')
  const durationLimit = maxDuration !== null && maxDuration < 120 ? maxDuration : null
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [formData, setFormData] = useState(getInitialFormData(stint, avgStintTime))
  const [errors, setErrors] = useState<FormErrors>({})
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
    const formErrors = validateForm(formData, durationLimit)
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
      driver: formData.driver,
      spotter: formData.spotter,
      tireFL: formData.tireFL,
      tireFR: formData.tireFR,
      tireRL: formData.tireRL,
      tireRR: formData.tireRR
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
                value={formData.duration}
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

          <FuelField
            value={formData.fuel}
            onChange={(value) => setFormData(prev => ({ ...prev, fuel: value }))}
            finishFuel={activeFinishFuel}
          />

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
              {t('save')}
            </TextButton>
          </ModalButtons>
        </Form>
      </ModalContent>
    </Overlay>
  )
}
