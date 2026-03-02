import { useState, useCallback } from 'react'
import { TextButton } from './components/TextButton'
import { IconButton } from './components/IconButton'
import PlusIcon from './assets/svg/PlusIcon.svg'
import TrashIcon from './assets/svg/TrashIcon.svg'
import './App.css'

interface Race {
  id: string
  name: string
  createdAt: Date
}

function App() {
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

  return (
    <div className="landing">
      <div className="landing-content">
        <h1 className="title">LE STINT ULTIMATE</h1>
        <p className="subtitle">Planuj stinty w swoim wyścigu</p>
        
        <div className="input-group">
          <input
            type="text"
            placeholder="Nazwa wyścigu"
            value={raceName}
            onChange={(e) => setRaceName(e.target.value)}
            className="race-input"
          />
          <TextButton onClick={handleAdd} className="add-button">
            <span className="add-text">Dodaj</span>
            <img src={PlusIcon} alt="" className="add-icon" />
          </TextButton>
        </div>

        <div className="races-list">
          {races.map((race) => (
            <div key={race.id} className="race-item">
              <div className="race-info">
                <span className="race-name">{race.name}</span>
                <span className="race-date">{race.createdAt.toLocaleDateString('pl-PL')}</span>
              </div>
              <div className="race-actions">
                <TextButton onClick={() => {}} className="secondary">Otwórz</TextButton>
                <IconButton onClick={() => handleDelete(race.id)} icon={TrashIcon} title="Usuń" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
