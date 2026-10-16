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
| `RATE_LIMIT_MAX` | `300` | Opcjonalnie: zapytań na minutę z jednego IP (domyślnie 300) |
| `RATE_LIMIT_RACE_WRITE_MAX` | `20` | Opcjonalnie: tworzenie/usuwanie wyścigów na minutę z jednego IP (domyślnie 20) |
| `TRUST_PROXY` | `loopback, linklocal, uniquelocal` | Opcjonalnie: którym proxy ufać przy ustalaniu IP klienta do limitów – liczba warstw (`2`) albo lista adresów/CIDR. Domyślnie adresy prywatne, co pasuje do Render |
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

Usługa `lestintultimate` (`https://lestintultimate.onrender.com`) jest skonfigurowana **ręcznie w panelu Render**. W repo nie ma `render.yaml` (Blueprint). Ustawienia (stan na 16.10.2026):

| Ustawienie | Wartość |
|---|---|
| Root Directory | *(puste – root repo)* |
| Build Command | `cd apps/backend && npm install && npm run build` |
| Start Command | `cd apps/backend && npm run start` |
| Health Check Path | `/health` |
| Zmienne środowiskowe | `MONGO_URI` (wymagana), opcjonalnie te z tabeli wyżej |

Deploy uruchamia się automatycznie po pushu do `main` i trwa kilka minut. Render stoi za Cloudflare, co ma znaczenie dla limitów zapytań (patrz [API.md](API.md#limity-zapytań)).

> **Uwaga: Render instaluje zależności przez npm, nie pnpm.** W `apps/backend` nie ma `package-lock.json`, a `pnpm-lock.yaml` jest dla npm niewidoczny. Każdy deploy instaluje więc najnowsze wersje dozwolone przez zakresy `^` w `package.json`, które mogą być inne niż wersje sprawdzane przez CI. Przy małej liczbie zależności i działającym deployu zostawiamy to tak.
>
> Próba przejścia na pnpm (`corepack enable && pnpm install …`) **nie działa** na Render bez przypięcia wersji pnpm: corepack pobiera wtedy najnowszy pnpm i build kończy się błędem `Cannot find module …/pnpm.cjs` (sprawdzone 16.10.2026). Gdyby kiedyś wracać do tematu, trzeba najpierw dodać `"packageManager": "pnpm@10.x.x"` w głównym `package.json` i przetestować build na Render.

### Health check na Render

W panelu Render (usługa backendu → *Settings → Health Check Path*) warto ustawić `/health`. Render nie przełączy wtedy ruchu na nową wersję, która nie łączy się z bazą, i będzie widać, kiedy backend nie działa.

## Zmiany API – zgodność wstecz

Frontend (Netlify) i backend (Render) wdrażają się **osobno i w różnym tempie**. Przez kilka–kilkanaście minut po merge'u nowy frontend może rozmawiać ze starym backendem.

16.10.2026 przez ok. 17 minut nie dało się dodawać stintów na produkcji. Nowy frontend wysyłał już `raceId`, a stary backend wymagał jeszcze `scheduleId`.

Dlatego przy zmianach API:

1. **Backend najpierw akceptuje oba warianty** (stare i nowe pole / stary i nowy kod odpowiedzi). Frontend przechodzi na nowy wariant dopiero, gdy ten backend jest na produkcji.
2. **Nie usuwaj pola ani trasy w tym samym PR**, w którym frontend przestaje ich używać. Usunięcie to osobny, późniejszy PR.
3. Po merge'u sprawdź, czy nowy backend jest na produkcji, np. zapytaniem, które pokazuje nowe zachowanie.

## Konwencje

- Komponenty: Atomic Design, każdy w swoim katalogu z `Nazwa.tsx` i `Nazwa.styles.ts`.
- Propsy stylów przejściowych w styled-components z prefiksem `$` (np. `$isActive`, `$variant`).
- Teksty UI wyłącznie przez i18next (`common`, `home`, `raceDetails`), pliki w `src/i18n/locales/{pl,en}`.
- Branche: `feature/...`, `fix/...`, merge przez PR na GitHubie.
