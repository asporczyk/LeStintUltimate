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
  SliderContainer,
  Slider,
  SliderValue,
  CheckboxGroup,
  InputWithUnit,
  InputUnit,
  InputWithUnitStyle,
  ErrorText
} from './EditStintModal.styles'

interface EditStintModalProps {
  isOpen: boolean
  stint: Stint
  drivers: string[]
  avgStintTime: number
  avgLapTime: number
  previousFuelLaps: number
  previousTires: number
  isFirstStint: boolean
  tireSets: number
  onConfirm: (updatedStint: Partial<Stint>) => void
  onCancel: () => void
}

interface FormErrors {
  duration?: string
  driver?: string
  spotter?: string
}

function getInitialFormData(stint: Stint, avgStintTime: number, isFirstStint: boolean, tireSets: number, previousTires: number) {
  const tires = isFirstStint ? tireSets : previousTires
  return {
    duration: stint.duration || avgStintTime,
    fuelLaps: stint.fuelLaps || 0,
    fuel: stint.fuel || 100,
    driver: stint.driver || '',
    spotter: stint.spotter || '',
    tireFL: stint.tireFL || '-',
    tireFR: stint.tireFR || '-',
    tireRL: stint.tireRL || '-',
    tireRR: stint.tireRR || '-',
    tires
  }
}

function validateForm(formData: ReturnType<typeof getInitialFormData>): FormErrors {
  const errors: FormErrors = {}

  if (!formData.duration || formData.duration < 0 || formData.duration > 120) {
    errors.duration = 'validation.stintTimeRange'
  }

  if (!formData.driver.trim()) {
    errors.driver = 'validation.required'
  }

  if (!formData.spotter.trim()) {
    errors.spotter = 'validation.required'
  }

  return errors
}

export function EditStintModal({ isOpen, stint, drivers, avgStintTime, avgLapTime, previousFuelLaps, previousTires, isFirstStint, tireSets, onConfirm, onCancel }: EditStintModalProps) {
  const { t } = useTranslation('raceDetails')
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [formData, setFormData] = useState(getInitialFormData(stint, avgStintTime, isFirstStint, tireSets, previousTires))
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(stint, avgStintTime, isFirstStint, tireSets, previousTires))
      setErrors({})
      cancelRef.current?.focus()
    }
  }, [isOpen, stint, avgStintTime, isFirstStint, tireSets, previousTires])

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

  const calculateFuelLaps = (duration: number, avgLapTimeSeconds: number, prevFuelLaps: number, isFirst: boolean): number => {
    if (isFirst) return 0
    if (duration <= 0 || avgLapTimeSeconds <= 0) return prevFuelLaps
    const laps = Math.floor(duration * 60 / avgLapTimeSeconds)
    return prevFuelLaps + laps
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Number(e.target.value)
    setFormData(prev => ({ ...prev, duration: newDuration }))
    if (errors.duration) setErrors(prev => ({ ...prev, duration: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formErrors = validateForm(formData)
    setErrors(formErrors)

    if (Object.keys(formErrors).length > 0) {
      return
    }

    const calculatedFuelLaps = calculateFuelLaps(formData.duration, avgLapTime, previousFuelLaps, isFirstStint)

    const changedTires = [
      formData.tireFL !== '-' ? 1 : 0,
      formData.tireFR !== '-' ? 1 : 0,
      formData.tireRL !== '-' ? 1 : 0,
      formData.tireRR !== '-' ? 1 : 0
    ].reduce((sum, v) => sum + v, 0)

    const calculatedTires = formData.tires - changedTires

    onConfirm({
      duration: formData.duration,
      fuelLaps: calculatedFuelLaps,
      fuel: formData.fuel,
      driver: formData.driver,
      spotter: formData.spotter,
      tireFL: formData.tireFL,
      tireFR: formData.tireFR,
      tireRL: formData.tireRL,
      tireRR: formData.tireRR,
      tires: calculatedTires
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
              {t('save')}
            </TextButton>
          </ModalButtons>
        </Form>
      </ModalContent>
    </Overlay>
  )
}
