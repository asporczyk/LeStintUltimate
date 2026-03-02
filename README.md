# Le Stint Ultimate

Narzędzie do planowania stintów w wyścigach długodystansowych inspirowane grą Le Mans Ultimate.

## Funkcje

- Planowanie stintów dla wyścigów długodystansowych
- Zarządzanie harmonogramem wyścigów
- Responsywny interfejs mobilny
- API do integracji z innymi systemami

## Technologie

### Frontend
- React 19
- Vite
- TypeScript
- Hanken Grotesk & Anton fonts

### Backend
- Fastify
- MongoDB (Mongoose)
- Socket.IO
- TypeScript

## Struktura projektu

```
LeStintUltimate/
├── apps/
│   ├── frontend/         # Aplikacja React
│   │   ├── src/
│   │   │   ├── App.tsx   # Główny komponent
│   │   │   └── App.css   # Style
│   │   └── package.json
│   │
│   └── backend/          # API serwer
│       ├── src/
│       │   ├── index.ts  # Entry point
│       │   ├── server.ts # Konfiguracja Fastify
│       │   ├── db.ts     # Połączenie z MongoDB
│       │   ├── routes/   # API endpoints
│       │   └── models/   # Modele Mongoose
│       └── package.json
│
└── package.json         # Workspace root
```

## Wymagania

- Node.js 20+
- MongoDB (lokalnie lub Docker)
- pnpm

## Instalacja

```bash
# Instalacja zależności
pnpm install

# Uruchomienie wszystkiego (frontend + backend)
pnpm dev
```

## Konfiguracja

Zmienne środowiskowe dla backend (`apps/backend/.env`):

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/stint-planner
```

## Development

```bash
# Uruchomienie wszystkiego (frontend + backend)
pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

## API Endpoints

- `GET /api/schedule/:raceId` - Pobierz harmonogram wyścigu

## Design

Kolorystyka inspirowana Le Mans Ultimate:
- Kolor główny: #FF1D44
- Tło: #000833 (gradient)

## Licencja

MIT
