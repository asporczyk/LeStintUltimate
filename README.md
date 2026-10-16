# Le Stint Ultimate

Narzędzie do planowania stintów w wyścigach długodystansowych inspirowane grą Le Mans Ultimate.

## Funkcje

- Lista wyścigów (limit 100) z parametrami: długość, kierowcy, komplety opon, zbiornik, średni czas okrążenia, zużycie paliwa, długość stintu
- Plan treningu i kwalifikacji, z automatycznie wyliczanym startem wyścigu
- Tabela stintów: kierowca, spotter, tankowanie, zmiana opon, okrążenie pit stopu, czasy z uwzględnieniem modelu pit stopu
- Podświetlanie aktualnie trwającego stintu
- Podsumowanie czasu jazdy kierowców i notatki do wyścigu
- Synchronizacja zmian na żywo między użytkownikami (Socket.IO)
- Interfejs PL/EN, responsywny

## Technologie

| Frontend | Backend |
|---|---|
| React 19, Vite 7, TypeScript | Fastify 5, TypeScript |
| styled-components, react-router 7 | MongoDB (Mongoose 8) |
| i18next, socket.io-client | Socket.IO 4, Swagger |

## Szybki start

```bash
pnpm install
pnpm dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/docs

Wymaga Node.js 20+, pnpm i MongoDB. Konfiguracja `.env`: [docs/ROZWOJ_I_WDROZENIE.md](docs/ROZWOJ_I_WDROZENIE.md).

## Dokumentacja

| Dokument | Zawartość |
|---|---|
| [Architektura](docs/ARCHITEKTURA.md) | Struktura monorepo, model danych, komponenty, przepływ danych |
| [API](docs/API.md) | Endpointy REST i zdarzenia Socket.IO |
| [Logika obliczeń](docs/LOGIKA_OBLICZEN.md) | Czasy sesji, pit stopy, okrążenia, opony |
| [Rozwój i wdrożenie](docs/ROZWOJ_I_WDROZENIE.md) | Uruchomienie, zmienne środowiskowe, Netlify/Render, konwencje |
| [Rekomendacje](docs/REKOMENDACJE.md) | Znalezione błędy i propozycje usprawnień |

## Struktura projektu

```
LeStintUltimate/
├── apps/
│   ├── frontend/      # React SPA (Netlify)
│   │   └── src/{api,components,hooks,i18n,pages,styles,types}
│   └── backend/       # Fastify API + Socket.IO (Render)
│       └── src/{index,server,socket,db}.ts, models/, routes/
├── docs/              # Dokumentacja
├── netlify.toml
└── pnpm-workspace.yaml
```

## Design

Kolorystyka inspirowana Le Mans Ultimate: kolor główny `#FF1D44`, tło – gradient `#000833` → `#001244`. Fonty: Anton (nagłówki), Hanken Grotesk (tekst).

## Licencja

MIT
