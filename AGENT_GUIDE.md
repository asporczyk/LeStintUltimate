# Przewodnik dla Agentów AI (Agent Guide) - Le Stint Ultimate

Ten plik zawiera szczegółowe informacje techniczne, architektoniczne i operacyjne dotyczące projektu **Le Stint Ultimate**, stworzone specjalnie z myślą o agentach AI (takich jak Copilot, opencode, itp.), którzy będą pracować nad tą aplikacją.

---

## 1. O projekcie i domenie biznesowej
- **Nazwa:** Le Stint Ultimate
- **Przeznaczenie:** Zaawansowane narzędzie webowe do planowania i koordynowania "stintów" (zmian kierowców, zużycia paliwa i opon) w wyścigach długodystansowych (endurance), inspirowane grą *Le Mans Ultimate*.
- **Główne funkcje:**
  - Tworzenie i edycja wyścigów (`Race`).
  - Automatyczne i ręczne planowanie stintów (`Stint`), treningów (`Training`) i kwalifikacji (`Qualification`).
  - Wsparcie dla wielu kierowców, zarządzanie limitami opon, pojemnością baku itp.
  - Automatyczne przeliczanie zużycia paliwa i okrążeń na podstawie parametrów wyścigu.
  - Real-time synchronizacja między użytkownikami za pomocą Socket.IO (blokowanie edycji stintów przez innych użytkowników, natychmiastowe odświeżanie zmian).

---

## 2. Architektura i Struktura Monorepo
Projekt jest zorganizowany jako **pnpm workspace** (monorepo).

### Główne foldery i pakiety:
- `/apps/frontend` - Aplikacja kliencka (React + Vite + TypeScript)
- `/apps/backend` - Serwer API (Fastify + Mongoose + Socket.IO)
- `/packages/shared` - Wspólne typy TypeScript wykorzystywane zarówno w backendzie, jak i frontendzie.

### Struktura plików:
```
LeStintUltimate/
├── apps/
│   ├── frontend/         # React SPA
│   │   ├── src/
│   │   │   ├── api/      # Klienty API (Races, Stints, Schedule, Qualification, Training)
│   │   │   ├── components/ # Atom, Molecules, Organisms (Atomic Design)
│   │   │   ├── hooks/    # Custom React hooks (np. useSocket, useRaces, usePitstopTime)
│   │   │   ├── i18n/     # Tłumaczenia i18next (PL / EN)
│   │   │   ├── pages/    # Podstrony (HomePage, RaceDetailsPage)
│   │   │   ├── styles/   # Globalny motyw (theme.ts) i styled-components
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   └── backend/          # API serwer
│       ├── src/
│       │   ├── models/   # Modele danych Mongoose (Race, Schedule, Stint, Training, Qualification)
│       │   ├── routes/   # Endpoints Fastify
│       │   ├── services/ # Logika biznesowa (np. StintService - przeliczanie paliwa/okrążeń)
│       │   ├── db.ts     # Połączenie z MongoDB
│       │   ├── server.ts # Inicjalizacja i konfiguracja wtyczek Fastify
│       │   ├── socket.ts # Logika WebSocketów (Socket.IO)
│       │   └── index.ts  # Punkt startowy
│       └── package.json
│
├── packages/
│   └── shared/           # Wspólne biblioteki
│       └── src/
│           ├── types/    # Interfejsy TypeScript (np. Race, Stint, Schedule, itp.)
│           └── index.ts  # Eksporty
│
├── package.json          # Root monorepo
├── pnpm-workspace.yaml   # Konfiguracja workspace
└── netlify.toml          # Konfiguracja hostingu frontend
```

---

## 3. Wspólne Typy (`packages/shared`)
Głównym źródłem prawdy dla modeli danych są interfejsy zdefiniowane w `packages/shared/src/types/index.ts`. Przy jakichkolwiek modyfikacjach schematów bazodanowych lub typów frontendowych należy najpierw zaktualizować te typy, a następnie przebudować pakiet shared komendą:
```bash
pnpm --filter @stint-ultimate/shared build
```

---

## 4. Backend (`apps/backend`)
### Technologie:
- **Fastify** - Szybki framework webowy.
- **Mongoose** - ORM do bazy MongoDB.
- **Socket.IO** - Real-time eventy do koordynacji stintów.

### Logika Real-time w `socket.ts`:
- Gdy użytkownik edytuje stint, aplikacja blokuje ten stint (`stint:lock`) na podstawie ID socketu (`lockedBy: socket.id`). Zapobiega to jednoczesnej edycji przez dwie osoby.
- Po zakończeniu edycji lub rozłączeniu, stint jest odblokowywany (`stint:unlock` lub `disconnect`).
- Po edycji wyścigu/stintu następuje rozesłanie aktualizacji przez WebSockets (`race:updated`, `stint:updated`, `stint:refresh`).

### Serwisy:
- `StintService.recalculateFuelLaps(raceId)`: Automatycznie przelicza skumulowane okrążenia (`fuelLaps`) dla wszystkich stintów w danym wyścigu po zmianie długości trwania stintu lub parametrów wyścigu (np. średniego czasu okrążenia `avgLapTime`).

---

## 5. Frontend (`apps/frontend`)
### Technologie:
- **React 19 + Vite**
- **Styled Components** - Stylowanie komponentów (podążaj za konwencją plików `.styles.ts`).
- **React Query (TanStack)** - Pobieranie danych i cache.
- **i18next** - Internacjonalizacja wspierająca polski (`pl`) i angielski (`en`).

### Temat graficzny i design:
- Kolorystyka inspirowana grą *Le Mans Ultimate*:
  - Główny kolor akcentu (czerwony): `#FF1D44`
  - Tło: `#000833` z gradientem.
- Używaj styled-components z motywu (`props.theme.colors.primary` itd.) zdefiniowanego w `src/styles/theme.ts`.

---

## 6. Procedury Operacyjne dla Agentów

### 1. Budowanie i Uruchamianie:
Aby zainstalować zależności i uruchomić projekt lokalnie w trybie developerskim (baza MongoDB musi działać):
```bash
pnpm install
pnpm dev
```
To polecenie uruchamia backend (port 3000) oraz frontend (port 5173) równolegle.

Aby zbudować cały projekt do wersji produkcyjnej:
```bash
pnpm build
```

### 2. Zmienne Środowiskowe:
Upewnij się, że w `apps/backend/.env` istnieją zmienne:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/stint-planner
```
Oraz w `apps/frontend/.env` (lub `.env.example`):
```env
VITE_API_URL=http://localhost:3000
```

### 3. Konwencje i reguły modyfikacji kodu:
- **Typy:** Zawsze utrzymuj spójność typów między frontendem, backendem i pakietem `@stint-ultimate/shared`.
- **Weryfikacja zmian:** Po dokonaniu zmian w kodzie, uruchom `pnpm build` w celu upewnienia się, że kompilator TypeScript nie zgłasza błędów w żadnym pakiecie.
- **Stylizowanie:** Twórz dedykowane pliki `.styles.ts` obok komponentów i korzystaj ze Styled Components. Unikaj stylów inline.
- **Tłumaczenia:** Jeśli dodajesz nowe elementy interfejsu z tekstem, zawsze dodaj odpowiednie klucze tłumaczeń do plików `apps/frontend/src/i18n/locales/pl/*.json` oraz `en/*.json` i używaj hooka `useTranslation()`.
