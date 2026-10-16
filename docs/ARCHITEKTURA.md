# Architektura

Le Stint Ultimate to monorepo (pnpm workspaces) z dwiema aplikacjami:

| Aplikacja | Ścieżka | Stack | Hosting |
|---|---|---|---|
| Frontend | `apps/frontend` | React 19, Vite 7, TypeScript, styled-components, react-router 7, i18next, socket.io-client | Netlify (`netlify.toml`) |
| Backend | `apps/backend` | Fastify 5, Mongoose 8 (MongoDB), Socket.IO 4, TypeScript (ESM) | Render (konfiguracja w panelu) |


## Przepływ danych

```
┌──────────────┐   REST (fetch)   ┌──────────────┐   Mongoose   ┌──────────┐
│   Frontend   │ ───────────────▶ │   Fastify    │ ───────────▶ │ MongoDB  │
│  React SPA   │                  │   /api/*     │              └──────────┘
│              │ ◀─────────────── │              │
│              │   Socket.IO      │  Socket.IO   │
└──────────────┘  (broadcast)     └──────────────┘
```

1. Każda zmiana (utworzenie/edycja/usunięcie) idzie przez REST.
2. Backend po zapisie wysyła zdarzenie Socket.IO do pokoju danego wyścigu (`emitToRace`).
3. Klienci filtrują zdarzenia po `raceId` / `_id` i aktualizują stan lub pobierają dane ponownie.

Dzięki temu kilka osób z zespołu może jednocześnie oglądać ten sam plan wyścigu i widzieć zmiany na żywo.

## Backend (`apps/backend/src`)

| Plik | Rola |
|---|---|
| `index.ts` | Punkt wejścia: ładuje `.env`, łączy z MongoDB, startuje HTTP i Socket.IO |
| `server.ts` | Buduje instancję Fastify: CORS, Swagger (`/docs`), rejestracja tras z prefiksem `/api` |
| `db.ts` | `connectDB(uri)` – połączenie Mongoose |
| `socket.ts` | Inicjalizacja Socket.IO i `getIO()` dla tras (tylko rozgłaszanie) |
| `models/` | Schematy Mongoose (patrz niżej) |
| `routes/` | Trasy REST – opis w [API.md](API.md) |
| `schemas.ts` | Schematy JSON walidujące params i body tras |
| `cors.ts` | Lista dozwolonych originów dla REST i Socket.IO |
| `services/stints.ts` | `recalculateFuelLaps()` – przelicza i zapisuje okrążenia startu stintów |
| `calculations.ts` | Czyste funkcje obliczeniowe (`computeFuelLaps`, `addMinutesToClock`) – testy w `test/` |

### Model danych

```
Race (1) ──┬── (0..1) Training        [raceId: string]
           ├── (0..1) Qualification   [raceId: string]
           └── (0..1) Schedule        [raceId: string]
                          └── (0..n) Stint   [scheduleId: ObjectId]
```

**Race** – wyścig i jego parametry:
`name`, `startDate`, `startTime` (`"HH:MM"`, domyślnie `19:30`), `raceLength` (h), `drivers[]`, `tireSets`, `fuelTankCapacity` (L), `avgLapTime` (s), `avgFuelPerLap` (% zbiornika), `avgStintTime` (min), `notes` (≤ 200 znaków).

**Training** – trening przed kwalifikacjami: `raceId`, `startTime`, `duration` (min).

**Qualification** – kwalifikacje: `raceId`, `startTime`, `duration`, `laps`, `driver`, `spotter`, `fuel`, `tireFL/FR/RL/RR`.

**Schedule** – kontener na stinty jednego wyścigu: `raceId`.

**Stint** – pojedynczy stint: `scheduleId`, `order` (od 1), `duration` (min), `driver`, `spotter`, `durationAuto` (czas z średniej wyścigu), `fuelLaps` (okrążenie startu, liczone na serwerze), `fuel` (% tankowania), `tireFL/FR/RL/RR` (`'N'` = zmiana, `'-'` = bez zmiany).

> Uwaga: `raceId` w Training/Qualification/Schedule to zwykły `String`, nie `ObjectId` z referencją.

## Frontend (`apps/frontend/src`)

Struktura oparta na **Atomic Design**:

```
src/
├── api/            # Wrappery REST (RacesApi, StintsApi, …); request.ts rzuca ApiError przy błędzie HTTP
├── components/
│   ├── atoms/      # Icon, IconButton, TextButton, ThemeToggle, CustomSelect, CustomCheckbox, Loader, Typography…
│   ├── molecules/  # Harmonogramy (Training/Qualification/Stint), modale edycji (wspólne style w Modal/), lista wyścigów
│   └── organisms/  # RacesDashboard
├── hooks/
│   ├── useSocket.ts        # Kontekst, typy zdarzeń i hook useSocket()
│   ├── SocketProvider.tsx  # Połączenie Socket.IO, pokoje wyścigów i subskrypcje zdarzeń
│   ├── useToast.ts         # showError() – komunikat o błędzie (ToastProvider w molecules/Toast)
│   └── useThemeMode.ts     # Motyw jasny/ciemny: tryb system/light/dark (ThemeModeProvider.tsx)
├── i18n/           # i18next, języki pl/en, przestrzenie: common, home, raceDetails
├── pages/          # HomePage (/), RaceDetailsPage (/race/:id)
├── styles/theme.ts # Paleta jasna i ciemna jako zmienne CSS, motyw styled-components, style globalne
├── types/          # Race, Stint, Schedule
└── utils/          # Czyste funkcje + testy: time, tires, pitstop, laps, raceClock, schedule, drivers
```

### Motywy

Kolory są zmiennymi CSS (`--primary`, `--surface`, `--text`, …) zdefiniowanymi w `styles/theme.ts` dla `:root[data-theme='dark']` i `:root[data-theme='light']`. Obiekt `theme.colors` w styled-components zawiera tylko odwołania `var(--…)`, więc zmiana motywu nie wymaga ponownego renderowania. Komponenty nie powinny używać kolorów wpisanych na sztywno.

Domyślnie motyw wynika z ustawień urządzenia (`prefers-color-scheme`). Przełącznik `ThemeToggle` (strona główna i strona wyścigu) zapisuje wybór `light`/`dark` w `localStorage` pod kluczem `theme`; tryb „systemowy” usuwa wpis. Skrypt w `index.html` ustawia `data-theme` przed pierwszym renderem, żeby nie było mignięcia.

### Harmonogramy jako karty

Trening, kwalifikacje i stinty są listą kart (`StintSchedule/ScheduleCard.tsx`), nie tabelą. Od 1000 px karta jest jednym wierszem (czas │ kierowca i spotter │ okrążenie, paliwo, wymiana opon, pozostałe opony │ akcje), węziej układa się w pionie. Poniżej 720 px (`MOBILE_QUERY` w `styles/theme.ts`) sekcje strony wyścigu sięgają krawędzi ekranu. Przycisk wstawiania stintu (`InsertDivider`) pojawia się po najechaniu myszą na przerwę między stintami, a na ekranach dotykowych jest widoczny stale jako mały „+”.

Aliasy importów (`vite.config.ts`): `@`, `api`, `components`, `pages`, `assets`, `types`, `styles`, `i18n`, `utils`.

### Routing

| Ścieżka | Strona | Zawartość |
|---|---|---|
| `/` | `HomePage` | Lista wyścigów, dodawanie/usuwanie (limit 100) |
| `/race/:id` | `RaceDetailsPage` | Parametry wyścigu, trening, kwalifikacje, tabela stintów, notatki, podsumowanie czasu kierowców |

`public/_redirects` przekierowuje wszystkie ścieżki na `index.html` (SPA na Netlify).

### Łańcuch czasu na stronie wyścigu

`RaceDetailsPage` składa trzy sekcje, które przekazują sobie czasy w górę przez callbacki:

```
TrainingSchedule ──onTrainingStartTime(koniec treningu)──▶ RaceDetailsPage
        │                                                       │
        │                              raceStartTime (fallback) ▼
QualificationSchedule ──onCalculatedRaceStart(start wyścigu)──▶ RaceDetailsPage
                                                                │
                                              startTime         ▼
                                                        StintSchedule
```

Szczegóły obliczeń: [LOGIKA_OBLICZEN.md](LOGIKA_OBLICZEN.md).

### Socket.IO po stronie klienta

`SocketProvider` tworzy jedno połączenie (URL = `VITE_API_URL` bez sufiksu `/api`) i udostępnia funkcje subskrypcji:
`onRaceUpdated`, `onStintRefresh`, `onTrainingUpdated`, `onQualificationUpdated`. Każda zwraca funkcję wyrejestrowania używaną w `useEffect`.
