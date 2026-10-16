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
| `PORT` | `3000` | Port HTTP (domyślnie 3000) |
| `MONGO_URI` | `mongodb://localhost:27017/stint-planner` | Connection string MongoDB (wymagany) |
| `CORS_ORIGINS` | `https://stint.example.com` | Opcjonalnie: dozwolone originy po przecinku, zastępują domyślną listę (patrz [API.md](API.md#cors)) |

### Frontend – `apps/frontend/.env` (wzór: `.env.example`)

| Zmienna | Przykład | Opis |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | Bazowy URL API **z sufiksem `/api`**. Socket.IO łączy się z tym samym hostem bez `/api` |

## Skrypty

| Miejsce | Skrypt | Działanie |
|---|---|---|
| root | `pnpm dev` | Frontend + backend równolegle |
| root | `pnpm build` | Build wszystkich paczek |
| root | `pnpm test` | Testy jednostkowe (vitest) we wszystkich paczkach |
| frontend | `pnpm lint` | ESLint |
| frontend | `pnpm build` | `tsc -b && vite build` → `apps/frontend/dist` |
| frontend | `pnpm preview` | Podgląd buildu |
| backend | `pnpm build` | `tsc` → `apps/backend/dist` |
| backend | `pnpm start` | `node dist/index.js` |

## Testy i CI

Testy (vitest):

- **frontend** – `src/utils/*.test.ts`: czas, opony, pit stop, okrążenia startu, start wyścigu przez północ, harmonogram, kierowcy.
- **backend, jednostkowe** – `test/calculations.test.ts`, `test/cors.test.ts`.
- **backend, integracyjne API** – `test/api.test.ts`: prawdziwy serwer i MongoDB. Sprawdzają walidację, okrążenia startu, kaskadę średniego czasu stintu, trening → kwalifikacje, kaskadowe usuwanie, pokoje Socket.IO i CORS.

Testy integracyjne uruchamiają się tylko, gdy ustawiona jest zmienna `TEST_MONGO_URI`. Każde uruchomienie tworzy osobną bazę i usuwa ją na końcu. Bez tej zmiennej są pomijane.

```bash
TEST_MONGO_URI=mongodb://localhost:27017 pnpm test
```

GitHub Actions (`.github/workflows/ci.yml`) na każdym PR i push do `main`: MongoDB jako usługa, `pnpm install --frozen-lockfile`, ESLint frontendu, `pnpm test` (z testami API), `pnpm build` (zawiera typecheck obu aplikacji).

`apps/frontend/package-lock.json` jest pozostałością po npm – źródłem prawdy jest `pnpm-lock.yaml` w roocie.

## Wdrożenie

### Frontend – Netlify

`netlify.toml`: instalacja pnpm, build `apps/frontend`, publikacja `apps/frontend/dist`. Zmienną `VITE_API_URL` trzeba ustawić w panelu Netlify (z `/api` na końcu).

### Backend – Render

Produkcyjny frontend (`le-stint-ultimate.netlify.app`) łączy się z backendem `https://lestintultimate.onrender.com`. Ta usługa ma inną nazwę niż w `render.yaml` (`stint-backend`), więc najpewniej jest skonfigurowana ręcznie w panelu Render, a `render.yaml` jej nie steruje.


`render.yaml` (Blueprint) definiuje usługę `stint-backend`: region Frankfurt, `rootDir: apps/backend`, build `pnpm install --prod=false && pnpm run build` (`tsc` → `dist/`), start `node dist/index.js`, `PORT=10000`, `MONGO_URI` ustawiany w panelu.

`--prod=false` jest potrzebne, bo przy `NODE_ENV=production` pnpm pominąłby `typescript` (devDependency).

Plik zawiera też statyczną usługę `stint-frontend` (alternatywa dla Netlify) z `VITE_API_URL=https://stint-backend.onrender.com/api`.

## Konwencje

- Komponenty: Atomic Design, każdy w swoim katalogu z `Nazwa.tsx` i `Nazwa.styles.ts`.
- Propsy stylów przejściowych w styled-components z prefiksem `$` (np. `$isActive`, `$variant`).
- Teksty UI wyłącznie przez i18next (`common`, `home`, `raceDetails`), pliki w `src/i18n/locales/{pl,en}`.
- Branche: `feature/...`, `fix/...`, merge przez PR na GitHubie.
