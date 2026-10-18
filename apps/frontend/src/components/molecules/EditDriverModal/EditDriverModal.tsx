import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { type Race, type DriverAvailability, type DriverPace } from 'types/Race'
import { DriverAvailabilityFields } from 'components/molecules/EditRaceModal/DriverAvailabilityFields'
import { PaceFields } from 'components/molecules/PaceFields/PaceFields'
import { ElectronicsFields } from 'components/molecules/ElectronicsFields/ElectronicsFields'
import { driverBlocks } from 'utils/availability'
import { paceInput, parsePaceInput, validatePaceInput, type PaceInputErrors } from 'utils/pace'
import { electronicsInput, parseElectronicsInput, validateElectronicsInput, type ElectronicsInputErrors } from 'utils/electronics'
import { addMinutesToClock } from 'utils/time'
import {
  Overlay,
  ModalContent,
  ModalTitle,
  Form,
  FormGroup,
  Label,
  ModalButtons,
  FieldHint
} from 'components/molecules/Modal/Modal.styles'

interface EditDriverModalProps {
  race: Race
  driver: string
  // Minutes from the event start (training) to the race start, after qualification.
  raceStartOffset: number
  // The race fields to save: the driver's entries replaced, everyone else's kept.
  onConfirm: (patch: Pick<Race, 'driverAvailability' | 'driverPace' | 'driverElectronics'>) => void
  onCancel: () => void
}

// One driver's settings: hours they can drive, their pace and car electronics.
export function EditDriverModal({ race, driver, raceStartOffset, onConfirm, onCancel }: EditDriverModalProps) {
  const { t } = useTranslation('raceDetails')
  const cancelRef = useRef<HTMLButtonElement>(null)
  const eventStartClock = race.startTime || '19:30'
  const [availability, setAvailability] = useState<DriverAvailability[]>(driverBlocks(race.driverAvailability, driver))
  const [pace, setPace] = useState(paceInput(race.driverPace?.find(entry => entry.driver === driver)))
  const [errors, setErrors] = useState<PaceInputErrors>({})
  const [electronics, setElectronics] = useState(electronicsInput(race.driverElectronics?.find(entry => entry.driver === driver)))
  const [electronicsErrors, setElectronicsErrors] = useState<ElectronicsInputErrors>({})

  // Parent remounts the modal (key) each time it opens, so state starts fresh.
  useEffect(() => {
    cancelRef.current?.focus()
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
    const paceErrors = validatePaceInput(pace)
    const settingsErrors = validateElectronicsInput(electronics)
    setErrors(paceErrors)
    setElectronicsErrors(settingsErrors)
    if (Object.keys(paceErrors).length > 0 || Object.keys(settingsErrors).length > 0) return

    const { avgLapTime, avgFuelPerLap } = parsePaceInput(pace)
    const ownPace: DriverPace[] = avgLapTime || avgFuelPerLap
      ? [{ driver, ...(avgLapTime && { avgLapTime }), ...(avgFuelPerLap && { avgFuelPerLap }) }]
      : []
    const ownElectronics = parseElectronicsInput(driver, electronics)
    onConfirm({
      // Only blocks with hours set.
      driverAvailability: [
        ...(race.driverAvailability || []).filter(entry => entry.driver !== driver),
        ...availability.filter(entry => entry.from || entry.to).map(({ from, to }) => ({ driver, from: from || '', to: to || '' })),
      ],
      driverPace: [...(race.driverPace || []).filter(entry => entry.driver !== driver), ...ownPace],
      driverElectronics: [
        ...(race.driverElectronics || []).filter(entry => entry.driver !== driver),
        ...(ownElectronics ? [ownElectronics] : []),
      ],
    })
  }

  return (
    <Overlay onClick={onCancel}>
      <ModalContent $width="480px" onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{t('editDriver', { driver })}</ModalTitle>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label as="span">{t('availability')}</Label>
            <FieldHint>{t('driverAvailabilityHint')}</FieldHint>
            <DriverAvailabilityFields
              drivers={[driver]}
              availability={availability}
              onChange={setAvailability}
              eventDate={race.startDate ? new Date(race.startDate).toISOString().split('T')[0] : ''}
              eventStartClock={eventStartClock}
              raceStartClock={addMinutesToClock(eventStartClock, raceStartOffset).slice(0, 5)}
              raceLength={race.raceLength || 0}
              showNames={false}
            />
          </FormGroup>

          <FormGroup>
            <Label as="span">{t('pace')}</Label>
            <PaceFields
              value={pace}
              inherited={{ avgLapTime: race.avgLapTime || 0, avgFuelPerLap: race.avgFuelPerLap || 0 }}
              errors={errors}
              hint={t('driverPaceHint')}
              onChange={(value) => {
                setPace(value)
                setErrors({})
              }}
            />
          </FormGroup>

          <FormGroup>
            <Label as="span">{t('electronics.title')}</Label>
            <FieldHint>{t('electronicsHint')}</FieldHint>
            <ElectronicsFields
              value={electronics}
              errors={electronicsErrors}
              onChange={(value) => {
                setElectronics(value)
                setElectronicsErrors({})
              }}
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
