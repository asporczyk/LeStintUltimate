import { useTranslation } from 'react-i18next'
import { WarningIcon } from 'components/atoms/IncidentIcon/IncidentIcon'
import { InsertBar, InsertButton, IncidentButton } from './StintSchedule.styles'

interface InsertDividerProps {
  after: number
  // Omitted once no stint can be inserted (the plan covers the race).
  onInsert?: () => void
  // Omitted when the stint above can't get an incident (it already has one).
  onIncident?: () => void
  // Keeps the incident button in view, e.g. under the stint in progress.
  pinned?: boolean
}

// Divider below a stint that offers inserting the next stint right there, or reporting
// an incident in the stint above.
export function InsertDivider({ after, onInsert, onIncident, pinned = false }: InsertDividerProps) {
  const { t } = useTranslation('raceDetails')
  const label = t('insertAfter', { after })
  const incidentLabel = t('reportIncident', { order: after })

  return (
    <InsertBar $pinned={pinned && !!onIncident} $canInsert={!!onInsert}>
      {onInsert && (
        <InsertButton type="button" onClick={onInsert} aria-label={label} title={label}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="label">{t('addStint')}</span>
        </InsertButton>
      )}
      {onIncident && (
        <IncidentButton type="button" onClick={onIncident} aria-label={incidentLabel} title={incidentLabel}>
          <WarningIcon />
          <span className="label">{t('incident')}</span>
        </IncidentButton>
      )}
    </InsertBar>
  )
}
