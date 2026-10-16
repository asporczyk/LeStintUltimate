# Rozwój i wdrożenie

## Wymagania

- Node.js 20+ (lokalnie używany jest Node 24)
- pnpm 10
- MongoDB (lokalnie lub Docker: `docker run -d -p 27017:27017 mongo:7`)

## Uruchomienie lokalne

```bash
pnpm install
pnpm dev
```

`pnpm dev` uruchamia równolegle:

- backend – `tsx watch src/index.ts` na `http://localhost:3000` (API pod `/api`, Swagger pod `/docs`)
- frontend – Vite na `http://localhost:5173`

## Zmienne środowiskowe

### Backend – `apps/backend/.env` (wzór: `.env.example`)

Pliki `.env` nie są commitowane – skopiuj `.env.example` do `.env`.

| Zmienna | Przykład | Opis |
|---|---|---|
| `PORT` | `3000` | Port HTTP (wymagany – brak domyślnej wartości) |
| `MONGO_URI` | `mongodb://localhost:27017/stint-planner` | Connection string MongoDB (wymagany) |

### Frontend – `apps/frontend/.env` (wzór: `.env.example`)

| Zmienna | Przykład | Opis |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | Bazowy URL API **z sufiksem `/api`**. Socket.IO łączy się z tym samym hostem bez `/api` |

## Skrypty

| Miejsce | Skrypt | Działanie |
|---|---|---|
| root | `pnpm dev` | Frontend + backend równolegle |
| root | `pnpm build` | Build wszystkich paczek |
| frontend | `pnpm lint` | ESLint |
| frontend | `pnpm build` | `tsc -b && vite build` → `apps/frontend/dist` |
| frontend | `pnpm preview` | Podgląd buildu |
| backend | `pnpm build` | `tsc` → `apps/backend/dist` |
| backend | `pnpm start` | `node dist/index.js` |

Projekt nie ma testów automatycznych ani CI.

## Wdrożenie

### Frontend – Netlify

`netlify.toml`: instalacja pnpm, build `apps/frontend`, publikacja `apps/frontend/dist`. Zmienną `VITE_API_URL` trzeba ustawić w panelu Netlify (z `/api` na końcu).

### Backend – Render

`render.yaml` (Blueprint) definiuje usługę `stint-backend`: region Frankfurt, `rootDir: apps/backend`, build `pnpm install --prod=false && pnpm run build` (`tsc` → `dist/`), start `node dist/index.js`, `PORT=10000`, `MONGO_URI` ustawiany w panelu.

`--prod=false` jest potrzebne, bo przy `NODE_ENV=production` pnpm pominąłby `typescript` (devDependency).

Plik zawiera też statyczną usługę `stint-frontend` (alternatywa dla Netlify) z `VITE_API_URL=https://stint-backend.onrender.com/api`.

## Konwencje

- Komponenty: Atomic Design, każdy w swoim katalogu z `Nazwa.tsx` i `Nazwa.styles.ts`.
- Propsy stylów przejściowych w styled-components z prefiksem `$` (np. `$isActive`, `$variant`).
- Teksty UI wyłącznie przez i18next (`common`, `home`, `raceDetails`), pliki w `src/i18n/locales/{pl,en}`.
- Branche: `feature/...`, `fix/...`, merge przez PR na GitHubie.
