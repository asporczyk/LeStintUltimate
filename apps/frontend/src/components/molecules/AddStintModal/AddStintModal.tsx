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
  ErrorText
} from './AddStintModal.styles'

interface AddStintModalProps {
  isOpen: boolean
  insertAfterStint: number
  totalStints: number
  raceId: string
  drivers: string[]
  avgStintTime: number
  avgLapTime: number
  previousFuelLaps: number
  previousTires: number
  isFirstStint: boolean
  tireSets: number
  allStints: Stint[]
  onStintAdded: (stint: Stint) => void
  onCancel: () => void
}

function getInitialFormData(avgStintTime: number, previousFuelLaps: number, avgLapTime: number, isFirst: boolean, tireSets: number, previousTires: number) {
  const duration = avgStintTime
  const laps = isFirst ? 0 : Math.floor(duration * 60 / avgLapTime)
  const fuelLaps = previousFuelLaps + laps
  const tires = isFirst ? tireSets : previousTires
  return {
    duration,
    fuelLaps,
    fuel: 100,
    driver: '',
    spotter: '',
    tireFL: '-',
    tireFR: '-',
    tireRL: '-',
    tireRR: '-',
    tires
  }
}

interface FormErrors {
  duration?: string
  driver?: string
  spotter?: string
}

export function AddStintModal({ isOpen, insertAfterStint, totalStints, raceId, drivers, avgStintTime, avgLapTime, previousFuelLaps, previousTires, isFirstStint, tireSets, onStintAdded, onCancel }: AddStintModalProps) {
  const { t } = useTranslation('raceDetails')
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [formData, setFormData] = useState(getInitialFormData(avgStintTime, previousFuelLaps, avgLapTime, isFirstStint, tireSets, previousTires))
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(avgStintTime, previousFuelLaps, avgLapTime, isFirstStint, tireSets, previousTires))
      setErrors({})
      cancelRef.current?.focus()
    }
  }, [isOpen, avgStintTime, avgLapTime, previousFuelLaps, isFirstStint, tireSets, previousTires])

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
      const changedTires = [
        formData.tireFL !== '-' ? 1 : 0,
        formData.tireFR !== '-' ? 1 : 0,
        formData.tireRL !== '-' ? 1 : 0,
        formData.tireRR !== '-' ? 1 : 0
      ].reduce((sum, v) => sum + v, 0)

      const calculatedTires = formData.tires - changedTires

      const newStint = await StintsApi.create({
        scheduleId: raceId,
        order: insertAfterStint + 1,
        startTime: 0,
        duration: formData.duration,
        driver: formData.driver,
        spotter: formData.spotter,
        fuelLaps: formData.fuelLaps,
        fuel: formData.fuel,
        tireFL: formData.tireFL,
        tireFR: formData.tireFR,
        tireRL: formData.tireRL,
        tireRR: formData.tireRR,
        tires: calculatedTires
      })
      onStintAdded(newStint)
      onCancel()
    } catch (err) {
      console.error('Failed to add stint', err)
    }
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Number(e.target.value)
    const laps = previousFuelLaps === 0 ? 0 : Math.floor(newDuration * 60 / avgLapTime)
    const newFuelLaps = previousFuelLaps + laps
    setFormData(prev => ({ ...prev, duration: newDuration, fuelLaps: newFuelLaps }))
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
            {errors.duration && <ErrorText>{t(errors.duration)}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>{t('pitstopLap')}</Label>
            <InputWithUnit>
              <InputWithUnitStyle
                type="number"
                value={formData.fuelLaps}
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
                value={formData.fuel}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, fuel: Number(e.target.value) }))}
              />
              <SliderValue>{formData.fuel}%</SliderValue>
            </SliderContainer>
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
