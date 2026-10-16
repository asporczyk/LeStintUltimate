import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RacesApi } from 'api/RacesApi'
import {
  NotesContainer,
  NotesLabel,
  NotesTextarea,
  CharCount,
  NotesFooter,
  SaveNotesButton
} from './StintSchedule.styles'

const MAX_CHARS = 200

interface NotesEditorProps {
  raceId: string
  notes?: string
}

export function NotesEditor({ raceId, notes: savedNotes }: NotesEditorProps) {
  const { t } = useTranslation('raceDetails')
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
    }
  }

  return (
    <NotesContainer>
      <NotesLabel>{t('notes')}</NotesLabel>
      <NotesTextarea
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
          <SaveNotesButton onClick={handleSaveNotes}>
            {t('saveNotes')}
          </SaveNotesButton>
        )}
      </NotesFooter>
    </NotesContainer>
  )
}
