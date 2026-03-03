import { useState, useCallback, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { TextButton } from '../components/atoms/TextButton/TextButton'
import { TextInput } from '../components/atoms/TextInput/TextInput.styles.ts'
import { RacesList } from '../components/organisms/RacesList/RacesList.tsx'
import { type Race } from '../types/Race'
import {Landing, LandingContent, Title, Subtitle, InputGroup, AddText, AddIcon} from './HomePage.styles'
import PlusIcon from '../assets/svg/plus.svg'

export function HomePage() {
  const { t } = useTranslation('home')
  const [raceName, setRaceName] = useState('')
  const [races, setRaces] = useState<Race[]>([
    { id: '1', name: '24h Le Mans 2025', createdAt: new Date('2025-01-15') },
    { id: '2', name: 'Sebring 12h', createdAt: new Date('2025-02-20') },
    { id: '3', name: 'Monza 6h', createdAt: new Date('2025-03-01') },
  ])

  const handleAdd = useCallback(() => {
    if (raceName.trim()) {
      const newRace: Race = {
        id: Date.now().toString(),
        name: raceName,
        createdAt: new Date(),
      }
      setRaces((prevRaces) => [...prevRaces, newRace])
      setRaceName('')
    }
  }, [raceName])

  const handleDelete = useCallback((id: string) => {
    setRaces((prevRaces) => prevRaces.filter((race) => race.id !== id))
  }, [])

  const handleOpen = useCallback((id: string) => {
    console.log('Open race:', id)
  }, [])

  return (
    <Landing>
      <LandingContent>
        <Title>{t('title')}</Title>
        <Subtitle>{t('subtitle')}</Subtitle>
        <InputGroup>
          <TextInput
            type="text"
            placeholder={t('raceNamePlaceholder')}
            value={raceName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRaceName(e.target.value)}
          />
          <TextButton onClick={handleAdd}>
            <AddText>{t('addRace')}</AddText>
            <AddIcon src={PlusIcon} alt="" />
          </TextButton>
        </InputGroup>
        <RacesList races={races} onDelete={handleDelete} onOpen={handleOpen} />
      </LandingContent>
    </Landing>
  )
}
