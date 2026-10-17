import { useTranslation } from 'react-i18next'
import { CustomSelect } from 'components/atoms/CustomSelect/CustomSelect'
import { NO_SPOTTER, type StintCrew } from 'utils/crew'
import { FormGroup, Label, ErrorText, FieldHint, FieldWarning } from 'components/molecules/Modal/Modal.styles'

interface StintCrewFieldsProps {
  crew: StintCrew
  errors: { driver?: string; spotter?: string }
  onDriverChange: (driver: string) => void
  onSpotterChange: (spotter: string) => void
}

// Driver and spotter of a stint, chosen from who is available at its time (see stintCrew).
export function StintCrewFields({ crew, errors, onDriverChange, onSpotterChange }: StintCrewFieldsProps) {
  const { t } = useTranslation('raceDetails')
  const noSpotter = crew.spotter === NO_SPOTTER
  // "None" appears only when it is set automatically.
  const spotterOptions = noSpotter
    ? [{ value: NO_SPOTTER, label: t('noSpotter') }]
    : crew.spotterOptions.map(({ name, partial }) => ({
      value: name,
      label: partial ? `${name} · ${t('partlyAvailable')}` : name,
    }))

  return (
    <>
      <FormGroup>
        <Label>{t('driver')}</Label>
        <CustomSelect
          value={crew.driver}
          onChange={onDriverChange}
          options={crew.driverOptions.map(d => ({ value: d, label: d }))}
        />
        {errors.driver && <ErrorText>{t(errors.driver)}</ErrorText>}
        {!errors.driver && crew.driverOptions.length === 0 && <FieldWarning>{t('noDriverAvailable')}</FieldWarning>}
        {crew.driverOptions.length === 1 && <FieldHint>{t('onlyAvailableDriver')}</FieldHint>}
      </FormGroup>

      <FormGroup>
        <Label>{t('spotter')}</Label>
        <CustomSelect value={crew.spotter} onChange={onSpotterChange} options={spotterOptions} />
        {errors.spotter && <ErrorText>{t(errors.spotter)}</ErrorText>}
        {noSpotter && <FieldHint>{t('noSpotterAvailable')}</FieldHint>}
        {!noSpotter && crew.spotterOptions.length === 1 && <FieldHint>{t('onlyAvailableSpotter')}</FieldHint>}
        {crew.partialSpotter && <FieldWarning>{t('spotterPartlyAvailable', { name: crew.spotter })}</FieldWarning>}
      </FormGroup>
    </>
  )
}
