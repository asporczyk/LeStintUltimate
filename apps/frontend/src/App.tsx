import { useState, useCallback } from 'react'
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
          <button onClick={handleAdd} className="start-button add-button">
            <span className="add-text">Dodaj</span>
            <svg className="add-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <div className="races-list">
          {races.map((race) => (
            <div key={race.id} className="race-item">
              <div className="race-info">
                <span className="race-name">{race.name}</span>
                <span className="race-date">{race.createdAt.toLocaleDateString('pl-PL')}</span>
              </div>
              <div className="race-actions">
                <button className="open-button">Otwórz</button>
                <button className="delete-button" title="Usuń" onClick={() => handleDelete(race.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
