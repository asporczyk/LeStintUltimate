import { useState, useEffect, useRef } from 'react'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { CustomSelect } from 'components/atoms/CustomSelect/CustomSelect'
import { useTranslation } from 'react-i18next'
import { type Qualification } from 'types/Race'
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
  InputWithUnitStyle
} from '../EditRaceModal/EditRaceModal.styles'

interface EditQualificationModalProps {
  isOpen: boolean
  qualification: Qualification
  raceStartTime: string
  avgLapTime: number
  avgFuelPerLap: number
  drivers: string[]
  onConfirm: (updatedQualification: Qualification, newRaceStartTime: string) => void
  onCancel: () => void
}

function addMinutesToTime(time: string, minutesToAdd: number): string {
  const [hours, mins] = time.split(':').map(Number)
  const totalMins = hours * 60 + mins + minutesToAdd
  const newHours = Math.floor(totalMins / 60) % 24
  const newMins = totalMins % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
}

export function EditQualificationModal({ 
  isOpen, 
  qualification,
  raceStartTime,
  avgLapTime,
  avgFuelPerLap,
  drivers,
  onConfirm, 
  onCancel 
}: EditQualificationModalProps) {
  const { t } = useTranslation('raceDetails')
  const cancelRef = useRef<HTMLButtonElement>(null)

  const [formData, setFormData] = useState({
    duration: qualification?.duration?.toString() || '30',
    driver: qualification?.driver || '',
    spotter: qualification?.spotter || ''
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({
        duration: qualification?.duration?.toString() || '30',
        driver: qualification?.driver || '',
        spotter: qualification?.spotter || ''
      })
    }
  }, [isOpen, qualification])

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
    const totalSeconds = Number(formData.duration) * 60
    const fullLaps = Math.floor(totalSeconds / avgLapTime)
    const remainingSeconds = totalSeconds % avgLapTime
    const laps = avgLapTime > 0 ? fullLaps + (remainingSeconds > 0 ? 1 : 0) : 0
    const fuel = avgFuelPerLap > 0 ? Math.ceil(laps * avgFuelPerLap) : 0
    const newRaceStartTime = addMinutesToTime(raceStartTime, Number(formData.duration) + 2)
    onConfirm({
      startTime: raceStartTime,
      duration: Number(formData.duration),
      laps,
      driver: formData.driver,
      spotter: formData.spotter,
      fuel,
      tireFL: 'N',
      tireFR: 'N',
      tireRL: 'N',
      tireRR: 'N'
    }, newRaceStartTime)
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{t('editQualification')}</ModalTitle>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>{t('duration')}</Label>
            <InputWithUnit>
              <InputWithUnitStyle
                type="number"
                value={formData.duration}
                onChange={handleChange('duration')}
                min="1"
                max="120"
              />
              <InputUnit>min</InputUnit>
            </InputWithUnit>
          </FormGroup>

          <FormGroup>
            <Label>{t('driver')}</Label>
            <CustomSelect
              value={formData.driver}
              onChange={(value) => setFormData(prev => ({ ...prev, driver: value }))}
              options={drivers.map(d => ({ value: d, label: d }))}
            />
          </FormGroup>

          <FormGroup>
            <Label>{t('spotter')}</Label>
            <CustomSelect
              value={formData.spotter}
              onChange={(value) => setFormData(prev => ({ ...prev, spotter: value }))}
              options={drivers.filter(d => d !== formData.driver).map(d => ({ value: d, label: d }))}
            />
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