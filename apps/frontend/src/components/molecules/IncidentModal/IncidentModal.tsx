import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { IncidentIcon } from 'components/atoms/IncidentIcon/IncidentIcon'
import { INCIDENT_COLORS, incidentSoft } from 'components/atoms/IncidentIcon/incidentColors'
import { INCIDENT_TYPES, type Incident, type IncidentType } from 'types/Schedule'
import { type LapRange } from 'utils/incidents'
import {
  Overlay,
  ModalContent,
  ModalTitle,
  Form,
  FormGroup,
  Label,
  NumberInput,
  ModalButtons,
  ErrorText,
  FieldHint,
  ModalText
} from 'components/molecules/Modal/Modal.styles'

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

const Option = styled.button<{ $type: IncidentType; $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: left;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ $active, $type, theme }) => $active ? INCIDENT_COLORS[$type] : theme.colors.borderStrong};
  background: ${({ $active, $type, theme }) => $active ? incidentSoft($type) : theme.colors.inputBg};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textSecondary};
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;

  svg {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    color: ${({ $type }) => INCIDENT_COLORS[$type]};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const Summary = styled(ModalText)`
  margin: 0;
  font-size: 0.875rem;
`

interface IncidentModalProps {
  // Stint the incident cuts short.
  stintOrder: number
  lapRange: LapRange
  // Lap the car should be on now.
  suggestedLap: number
  // Duration of the cut stint for a lap, to show what will change.
  durationForLap: (lap: number) => number
  // Whether there is a stint after this one to edit next (otherwise one gets added).
  hasNextStint: boolean
  onConfirm: (incident: Incident) => void
  onCancel: () => void
}

// First step of an incident: when it happened and what it was. The stint is cut to that
// lap; for anything but a written-off car the next stint is edited afterwards.
export function IncidentModal({ stintOrder, lapRange, suggestedLap, durationForLap, hasNextStint, onConfirm, onCancel }: IncidentModalProps) {
  const { t } = useTranslation('raceDetails')
  const lapRef = useRef<HTMLInputElement>(null)
  const [lap, setLap] = useState<number | ''>(suggestedLap)
  const [type, setType] = useState<IncidentType>('weatherChange')
  const [error, setError] = useState(false)
  const lapValid = lap !== '' && Number.isInteger(lap) && lap >= lapRange.min && lap <= lapRange.max
  const raceOver = type === 'totalDamage'

  useEffect(() => {
    lapRef.current?.select()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lapValid) {
      setError(true)
      return
    }
    onConfirm({ type, lap })
  }

  return (
    <Overlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()} aria-labelledby="incident-title">
        <ModalTitle id="incident-title">{t('reportIncident', { order: stintOrder })}</ModalTitle>
        <Form onSubmit={handleSubmit} noValidate>
          <FormGroup>
            <Label htmlFor="incident-lap">{t('incidentLap')}</Label>
            <NumberInput
              id="incident-lap"
              ref={lapRef}
              type="number"
              inputMode="numeric"
              min={lapRange.min}
              max={lapRange.max}
              step={1}
              value={lap}
              onChange={(e) => {
                setLap(e.target.value === '' ? '' : Number(e.target.value))
                setError(false)
              }}
            />
            {error
              ? <ErrorText>{t('validation.incidentLapRange', { ...lapRange })}</ErrorText>
              : <FieldHint>{t('incidentLapHint', { ...lapRange })}</FieldHint>}
          </FormGroup>

          <FormGroup role="radiogroup" aria-label={t('incidentType')}>
            <Label as="span">{t('incidentType')}</Label>
            <Options>
              {INCIDENT_TYPES.map(option => (
                <Option
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={type === option}
                  $type={option}
                  $active={type === option}
                  onClick={() => setType(option)}
                >
                  <IncidentIcon type={option} />
                  {t(`incidentTypes.${option}`)}
                </Option>
              ))}
            </Options>
          </FormGroup>

          {lapValid && (
            <Summary role="status">
              {t('incidentCut', { order: stintOrder, lap, duration: durationForLap(lap) })}{' '}
              {raceOver ? t('incidentRaceOver') : hasNextStint ? t('incidentNextStint') : t('incidentNewStint')}
            </Summary>
          )}

          <ModalButtons>
            <TextButton type="button" $variant="secondary" onClick={onCancel}>
              {t('cancel')}
            </TextButton>
            <TextButton type="submit" $variant={raceOver ? 'danger' : 'primary'}>
              {raceOver ? t('save') : t('next')}
            </TextButton>
          </ModalButtons>
        </Form>
      </ModalContent>
    </Overlay>
  )
}
