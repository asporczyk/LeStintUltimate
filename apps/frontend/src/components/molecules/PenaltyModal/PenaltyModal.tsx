import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { PENALTY_TYPES, type Penalty, type PenaltyType } from 'types/Schedule'
import { type LapRange } from 'utils/incidents'
import { DEFAULT_STOP_SECONDS, PENALTY_SHORT, STOP_SECONDS_OPTIONS, penaltySeconds } from 'utils/penalties'
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

const Options = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, 1fr);
  gap: 0.375rem;
`

const Option = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.borderStrong};
  background: ${({ $active, theme }) => $active ? theme.colors.surfaceRaised : theme.colors.inputBg};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textSecondary};
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;

  svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const Short = styled.span`
  padding: 0 0.3125rem;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.surface};
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.04em;
`

const StopRow = styled.div`
  display: grid;
  grid-template-columns: repeat(${STOP_SECONDS_OPTIONS.length}, 1fr) 6rem;
  gap: 0.375rem;
`

const Summary = styled(ModalText)`
  margin: 0;
  font-size: 0.875rem;
`

interface PenaltyModalProps {
  stintOrder: number
  lapRange: LapRange
  // Lap the car should be on now.
  suggestedLap: number
  pitLaneTime: number
  // Clock at which the stint ends with `seconds` more of penalties.
  endClockFor: (seconds: number) => string
  hasNextStint: boolean
  onConfirm: (penalty: Penalty) => void
  onCancel: () => void
}

// A drive through or a stop and go served during the stint: on which lap and, for a stop
// and go, how long the car stands. The stint keeps its laps and ends later.
export function PenaltyModal({ stintOrder, lapRange, suggestedLap, pitLaneTime, endClockFor, hasNextStint, onConfirm, onCancel }: PenaltyModalProps) {
  const { t } = useTranslation('raceDetails')
  const lapRef = useRef<HTMLInputElement>(null)
  const [lap, setLap] = useState<number | ''>(suggestedLap)
  const [type, setType] = useState<PenaltyType>('driveThrough')
  const [stopSeconds, setStopSeconds] = useState<number | ''>(DEFAULT_STOP_SECONDS)
  const [error, setError] = useState(false)
  const lapValid = lap !== '' && Number.isInteger(lap) && lap >= lapRange.min && lap <= lapRange.max
  const stopValid = type === 'driveThrough' || (stopSeconds !== '' && stopSeconds >= 0 && stopSeconds <= 300)
  const penalty: Penalty = type === 'stopAndGo'
    ? { type, lap: Number(lap), stopSeconds: Number(stopSeconds) }
    : { type, lap: Number(lap) }
  const seconds = Math.round(penaltySeconds(penalty, pitLaneTime))

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
    if (!lapValid || !stopValid) {
      setError(true)
      return
    }
    onConfirm(penalty)
  }

  return (
    <Overlay onClick={onCancel}>
      <ModalContent onClick={(e) => e.stopPropagation()} aria-labelledby="penalty-title">
        <ModalTitle id="penalty-title">{t('addPenaltyTitle', { order: stintOrder })}</ModalTitle>
        <Form onSubmit={handleSubmit} noValidate>
          <FormGroup role="radiogroup" aria-label={t('penaltyType')}>
            <Label as="span">{t('penaltyType')}</Label>
            <Options $columns={PENALTY_TYPES.length}>
              {PENALTY_TYPES.map(option => (
                <Option
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={type === option}
                  $active={type === option}
                  onClick={() => setType(option)}
                >
                  <Short>{PENALTY_SHORT[option]}</Short>
                  {t(`penaltyTypes.${option}`)}
                </Option>
              ))}
            </Options>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="penalty-lap">{t('penaltyLap')}</Label>
            <NumberInput
              id="penalty-lap"
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
            {error && !lapValid
              ? <ErrorText>{t('validation.incidentLapRange', { ...lapRange })}</ErrorText>
              : <FieldHint>{t('penaltyLapHint', { ...lapRange })}</FieldHint>}
          </FormGroup>

          {type === 'stopAndGo' && (
            <FormGroup>
              <Label htmlFor="penalty-stop">{t('penaltyStop')}</Label>
              <StopRow>
                {STOP_SECONDS_OPTIONS.map(option => (
                  <Option
                    key={option}
                    type="button"
                    aria-pressed={stopSeconds === option}
                    $active={stopSeconds === option}
                    onClick={() => setStopSeconds(option)}
                  >
                    {option} s
                  </Option>
                ))}
                <NumberInput
                  id="penalty-stop"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={300}
                  step={1}
                  value={stopSeconds}
                  aria-label={t('penaltyStop')}
                  onChange={(e) => {
                    setStopSeconds(e.target.value === '' ? '' : Number(e.target.value))
                    setError(false)
                  }}
                />
              </StopRow>
              {error && !stopValid && <ErrorText>{t('validation.penaltyStop')}</ErrorText>}
            </FormGroup>
          )}

          {lapValid && stopValid && (
            <Summary role="status">
              {type === 'stopAndGo'
                ? t('penaltyLossStop', { seconds, lane: Math.round(pitLaneTime), stop: Number(stopSeconds) })
                : t('penaltyLossDrive', { seconds })}{' '}
              {t('penaltyEnd', { order: stintOrder, clock: endClockFor(seconds) })}{' '}
              {hasNextStint && t('penaltyShift')}
            </Summary>
          )}

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
