import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RacesApi } from 'api/RacesApi'
import {
  NotesContainer,
  NotesLabel,
  NotesTextarea,
  CharCount,
  NotesFooter
} from './StintSchedule.styles'
import { TextButton } from 'components/atoms/TextButton/TextButton'
import { useToast } from '@/hooks/useToast'

const MAX_CHARS = 200

interface NotesEditorProps {
  raceId: string
  notes?: string
}

export function NotesEditor({ raceId, notes: savedNotes }: NotesEditorProps) {
  const { t } = useTranslation('raceDetails')
  const { showError } = useToast()
  const [notes, setNotes] = useState(savedNotes || '')
  const [notesModified, setNotesModified] = useState(false)

  // Sync notes when another client saves them (adjusting state during render).
  const [prevSavedNotes, setPrevSavedNotes] = useState(savedNotes)
  if (savedNotes !== prevSavedNotes) {
    setPrevSavedNotes(savedNotes)
    setNotes(savedNotes || '')
  }

  const handleNotesChange = (value: string) => {
    setNotes(value)
    setNotesModified(value !== (savedNotes || ''))
  }

  const handleSaveNotes = async () => {
    try {
      await RacesApi.update(raceId, { notes })
      setNotesModified(false)
    } catch (err) {
      console.error('Failed to save notes', err)
      showError(t('save-failed', { ns: 'common' }))
    }
  }

  return (
    <NotesContainer>
      <NotesLabel htmlFor={`notes-${raceId}`}>{t('notes')}</NotesLabel>
      <NotesTextarea
        id={`notes-${raceId}`}
        value={notes}
        onChange={(e) => handleNotesChange(e.target.value.slice(0, MAX_CHARS))}
        placeholder={t('notesPlaceholder')}
        rows={3}
      />
      <NotesFooter>
        <CharCount $isOver={notes.length >= MAX_CHARS}>
          {notes.length}/{MAX_CHARS}
        </CharCount>
        {notesModified && (
          <TextButton $size="sm" onClick={handleSaveNotes}>
            {t('saveNotes')}
          </TextButton>
        )}
      </NotesFooter>
    </NotesContainer>
  )
}
