import { useEffect, useState } from 'react'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useTranslation } from 'react-i18next'
import { type Training } from 'api/TrainingApi'
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
  ErrorText
} from '../EditRaceModal/EditRaceModal.styles'

interface EditTrainingModalProps {
  isOpen: boolean
  training: Training | null
  raceStartTime: string
  onConfirm: (updatedTraining: Partial<Training>) => void
  onCancel: () => void
}

export function EditTrainingModal({ 
  isOpen, 
  training,
  raceStartTime,
  onConfirm, 
  onCancel 
}: EditTrainingModalProps) {
  const { t } = useTranslation('raceDetails')

  const [formData, setFormData] = useState({
    duration: training?.duration?.toString() || '30'
  })

  const [durationError, setDurationError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const duration = Number(formData.duration)
    if (!(duration >= 1 && duration <= 120)) {
      setDurationError(true)
      return
    }
    onConfirm({
      startTime: raceStartTime,
      duration
    })
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (field === 'duration') setDurationError(false)
  }

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <Overlay onClick={onCancel}>
      <ModalContent $width="400px" onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{training ? t('editTraining') : t('addTraining')}</ModalTitle>
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
            {durationError && <ErrorText>{t('validation.durationRange')}</ErrorText>}
          </FormGroup>

          <ModalButtons>
            <TextButton type="button" $variant="secondary" onClick={onCancel}>
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