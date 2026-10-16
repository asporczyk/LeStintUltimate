import { useTranslation } from 'react-i18next'
import { InsertBar, InsertButton } from './StintSchedule.styles'

interface InsertDividerProps {
  after: number
  onInsert: () => void
}

// Divider below a stint that offers inserting the next stint right there.
export function InsertDivider({ after, onInsert }: InsertDividerProps) {
  const { t } = useTranslation('raceDetails')
  const label = t('insertAfter', { after })

  return (
    <InsertBar>
      <InsertButton type="button" onClick={onInsert} aria-label={label} title={label}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span className="label">{t('addStint')}</span>
      </InsertButton>
    </InsertBar>
  )
}
