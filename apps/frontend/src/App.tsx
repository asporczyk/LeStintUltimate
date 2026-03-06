import { Routes, Route } from 'react-router-dom'
import { HomePage } from 'pages/HomePage'
import { RaceDetailsPage } from 'pages/RaceDetailsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/race/:id" element={<RaceDetailsPage />} />
    </Routes>
  )
}

export default App
