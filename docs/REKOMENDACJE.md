# Rekomendacje poprawek

Wynik przeglądu kodu z 2026-10-16. Pogrupowane wg priorytetu. `tsc` przechodzi w obu aplikacjach, `eslint` we frontendzie zgłasza 16 błędów.

✅ = naprawione (branche `fix/review-bugs` i `improve/code-quality`). Po poprawkach: `eslint` 0 błędów, 25 testów jednostkowych, CI w GitHub Actions.

## 🔴 Wysoki priorytet – błędy

### ✅ 1. Zmiana treningu „czyści” dane kwalifikacji w UI
`training.routes.ts` po `PATCH` emituje `qualification:updated` z niepełnym obiektem `{ raceId, startTime }`. `QualificationSchedule` robi `setQualification(updatedQualification)`, więc u wszystkich klientów znikają `duration`, `driver`, `spotter`, `laps` itd. aż do przeładowania strony.
**Poprawka:** wynik `Qualification.findOneAndUpdate(..., { new: true })` emitować w całości (i tylko gdy kwalifikacje istnieją).

### ✅ 2. Usunięcie wyścigu zostawia osierocone dane
`DELETE /races/:id` usuwa tylko `Race`. `Schedule`, `Stint`, `Training`, `Qualification` zostają w bazie na zawsze.
**Poprawka:** kaskadowe `deleteMany` dla wszystkich powiązanych kolekcji.

### ✅ 3. Warstwa `api/` nie sprawdza `res.ok`
`create`/`update`/`getAll` zwracają `res.json()` niezależnie od statusu. Przy `400`/`500` komponent dostaje `{ error: "..." }` jako dane (np. `setRace({error})` w `RaceDetailsPage`, cicha porażka przy limicie 100 wyścigów).
**Poprawka:** wspólny helper `request()` rzucający wyjątek przy `!res.ok` + komunikat w UI.

### ✅ 4. Nieprawidłowe ID → 500
`Race.findById("abc")` rzuca `CastError`, co daje `500`. Dotyczy `/races/:id`, `/training/:raceId` (POST/PATCH), `/stints`.
**Poprawka:** walidacja `mongoose.isValidObjectId()` lub schemat Fastify dla params → `400`/`404`.

### ✅ 5. Brak `key` na fragmencie w `StintSchedule`
`stints.map(... => <>...</>)` – klucze są na wewnętrznych `TableRow`, a nie na fragmencie. React zgłasza ostrzeżenie i może źle odtwarzać wiersze przy wstawianiu stintu w środek.
**Poprawka:** `<Fragment key={stint._id}>`.

### ✅ 6. Konfiguracja Render jest niespójna
**Stan:** `render.yaml` używa `rootDir`, pnpm i uruchamia `tsc`; `VITE_API_URL` ma `/api`. Jeśli usługi na Render są skonfigurowane ręcznie w panelu (nie przez Blueprint), plik nic nie zmienia – trzeba to sprawdzić w panelu.

- `buildCommand: cd apps/backend && npm install` nie uruchamia `tsc`, a `startCommand: node dist/index.js` wymaga zbudowanego `dist/` (który jest w `.gitignore`). Do tego `startCommand` uruchamia się z roota repo, gdzie `dist/` nie ma.
- `VITE_API_URL` dla `stint-frontend` nie ma sufiksu `/api`, a frontend dokleja tylko `/races` itd.
- Projekt używa pnpm, Render – npm (inne lockfile).

Jeśli Render faktycznie działa, to dzięki ustawieniom nadpisanym w panelu – warto zsynchronizować plik z rzeczywistością albo usunąć nieużywaną usługę `stint-frontend`.

## 🟠 Bezpieczeństwo

### ✅ 7. `CORS: *` (uwierzytelnianie – świadomie pominięte)
**Decyzja:** aplikacja ma być dostępna dla każdego, kto ma link – logowania **nie dodajemy**.

**Stan:** CORS (REST i Socket.IO) ograniczony do znanych domen frontendu (`apps/backend/src/cors.ts`, nadpisywalne przez `CORS_ORIGINS`). Inne strony nie mogą używać API z przeglądarek swoich użytkowników. To nie blokuje zapytań spoza przeglądarki (curl, skrypty) – przed niechcianymi zmianami chroni walidacja z pkt 8.

### ✅ 8. Niewalidowane patche
**Stan:** wszystkie trasy mają schematy w `apps/backend/src/schemas.ts` (params z walidacją ObjectId, body z zakresami wartości); nieznane pola są usuwane przez Ajv. Nieużywane handlery socketowe i pole `lockedBy` usunięte. Schematy nie mają jeszcze opisów odpowiedzi, więc Swagger pokazuje tylko wejście.

`PATCH /races/:id`, `PATCH /qualification`, socket `race:update` i `stint:update` przyjmują dowolny obiekt i wykonują `$set` / `Object.assign`. Można dopisać dowolne pola lub nadpisać `_id`/`lockedBy`.
**Poprawka:** schematy JSON w Fastify (`schema: { body, params }`) – przy okazji uzupełnią Swagger pod `/docs`. Nieużywane handlery socketowe (`stint:lock/update/unlock`, `race:update`) można usunąć.

### ✅ 9. `apps/backend/.env` jest w repozytorium
Plik jest śledzony w git mimo wpisu `.env` w `.gitignore` (dodany przed regułą). Obecnie zawiera tylko lokalny URI, ale każda przyszła zmiana na URI Atlasa z hasłem trafi do publicznego repo.
**Poprawka:** `git rm --cached apps/backend/.env` + dodać `apps/backend/.env.example`.

## 🟡 Logika domenowa – do weryfikacji

### ✅ 10. Formuła `fuelLaps`
**Decyzja:** kolumna pokazuje okrążenie, od którego zaczyna się stint. Teraz: pełne okrążenia ze wszystkich wcześniejszych stintów, liczone z łącznego czasu (stint #1 = 0), z testami. Kolumna nazywa się „Okrążenie startu”.

### ✅ 11. Kaskada `avgStintTime`
**Decyzja:** średnia ma zmieniać stinty, w których czas był uzupełniony automatycznie. Teraz: flaga `Stint.durationAuto` (patrz [LOGIKA_OBLICZEN.md](LOGIKA_OBLICZEN.md) 3a).

### ✅ 12. Aktywny stint ignoruje datę wyścigu
Teraz: liczony od daty wyścigu, z przejściem na następny dzień, gdy start wyścigu po treningu i kwalifikacjach wypada po północy (`utils/raceClock.ts`, testy).

### ✅ 13. Niespójne formaty godzin
Wszystkie tabele pokazują godziny jako `HH:MM:SS` (`formatClock`). Wcześniej trening z sekundami wyświetlał się jako `20:00:00:00`. W danych oba formaty (`HH:MM` i `HH:MM:SS`) dalej są dopuszczalne, a wszystkie obliczenia obsługują oba.

### ⏸️ 14. Logika obliczeń w dwóch miejscach (świadomie odłożone)
`computeFuelLaps`/`stintStartLap` i `addMinutesToClock` istnieją w backendzie i frontendzie. Obie wersje są małe i pokryte testami.

Wspólny pakiet w `packages/shared` wymagałby, żeby build backendu na Render kompilował też ten pakiet. Produkcyjny backend (`lestintultimate.onrender.com`) jest skonfigurowany ręcznie w panelu Render, więc zmiana grozi niedziałającym deployem. Warto wrócić do tematu, gdy konfiguracja Render będzie w repo (Blueprint).

## 🔵 Jakość kodu

15. ✅ **Duplikacja w `schedule.routes.ts`** – jedna funkcja `recalculateFuelLaps()`; czysta logika w `apps/backend/src/calculations.ts`.
16. ✅ **Pole `scheduleId` w `POST /stints`** – zmienione na `raceId`.
17. ✅ **`StintSchedule` omijał warstwę `api/`** – teraz używa `ScheduleApi`/`RacesApi` (naprawione razem z pkt 3).
18. ✅ **`StintSchedule.tsx` był duży** – duplikaty w `utils/`, podział na `StintRow`, `NotesEditor`, `DriverSummary` (445 → 194 linie), czasy startów liczone w jednym przebiegu (`utils/schedule.ts`).
19. ✅ **`usePitstopTime.ts` to nie hook** – przeniesione do `utils/pitstop.ts`, martwe gałęzie `CONCURRENT_*` usunięte.
20. ✅ **ESLint: 0 błędów** – typowane zdarzenia socketu, `SocketProvider` w osobnym pliku, modale montowane od nowa przez `key` zamiast resetu stanu w efekcie.
21. ✅ **i18n** – teraz: wykrywanie języka przeglądarki (zapamiętane w localStorage, domyślnie polski), daty w bieżącym języku, przetłumaczone „Ładowanie...”, backend po angielsku. Było: `lng: 'pl'` wyłącza `LanguageDetector`; daty formatowane na sztywno `toLocaleDateString('pl-PL')`; „Loading...” w `TrainingSchedule`/`QualificationSchedule` nie jest tłumaczone; komunikaty błędów backendu mieszają PL i EN.
22. ✅ **Startup backendu** – `Number(process.env.PORT)` daje `NaN` bez zmiennej, `MONGO_URI!` bez sprawdzenia. Teraz: `PORT` domyślnie 3000, brak `MONGO_URI` lub zły `PORT` kończy proces czytelnym komunikatem.
23. ✅ **Nieużywane pola** – `Stint.startTime`, `Stint.tires`, `Schedule.version` i `Stint.lockedBy` usunięte.
24. ✅ **`Training`/`Qualification` POST nie emitowały zdarzeń** – inni użytkownicy nie zobaczą nowo dodanego treningu/kwalifikacji bez odświeżenia.
25. ✅ **`io.emit` do wszystkich** – teraz pokoje Socket.IO per wyścig (`race:join` / `race:leave`).

31. ✅ **Błędy zapisu były niewidoczne** – nieudany zapis stintu, treningu, kwalifikacji, notatek czy wyścigu trafiał tylko do konsoli. Teraz użytkownik widzi komunikat (toast).
32. ✅ **Brak treningu/kwalifikacji jako błąd** – API zwracało `404` (czerwone błędy w konsoli przy każdym wyścigu bez treningu). Teraz `204`.
33. ✅ **API bez testów w CI** – testy integracyjne z prawdziwym MongoDB (`apps/backend/test/api.test.ts`).

34. ✅ **Brak limitów zapytań** – publiczne API bez logowania można było zalać zapytaniami lub zapełnić wspólny limit 100 wyścigów. Teraz: limity per IP (`@fastify/rate-limit`), ostrzejsze dla tworzenia/usuwania wyścigów.
34a. ✅ **Limit liczony nie od tego IP** – sprawdzone na produkcji. Najpierw (`trustProxy: true`) dało się go obejść fałszywym `X-Forwarded-For`. Po poprawce na `trustProxy: 1` liczył się według wewnętrznych load balancerów Render (`10.x`, kilka różnych na zapytanie, widoczne w logach Render). Teraz: ufamy adresom prywatnym i bierzemy pierwszy publiczny adres od prawej. Test odtwarza oba błędy. Na produkcji okazało się, że przed Render stoi jeszcze Cloudflare (`172.69.x`, `162.158.x` w logach), więc teraz klucz limitu to `CF-Connecting-IP`, akceptowany tylko od adresów Cloudflare.
35. ✅ **Brak health checku** – `GET /health` (200/503 wg połączenia z MongoDB). Do ustawienia w panelu Render jako *Health Check Path*.
36. ✅ **Niezgodne wdrożenia frontendu i backendu** – po merge'u #25 przez ok. 17 min nie działało dodawanie stintów (patrz [ROZWOJ_I_WDROZENIE.md](ROZWOJ_I_WDROZENIE.md#zmiany-api--zgodność-wstecz)). Dodana zasada zgodności wstecz dla zmian API.

## ⚪ Porządki w repo

26. README był nieaktualny (np. `i18n.ts` jako entry point backendu, `App.css`, jeden endpoint) – zaktualizowany razem z tą dokumentacją.
27. `dev_output.log` w roocie (ignorowany przez `*.log`, ale wskazuje na nieistniejący `src/services/StintService.ts`) – można usunąć.
28. `packages/shared` – nieśledzony, zawiera tylko `dist/` i `node_modules/`. Albo go wykorzystać (pkt 14), albo usunąć z `pnpm-workspace.yaml`.
29. ✅ `netlify.toml` – usunięty `node_bundler`, instalacja z `--frozen-lockfile`; usunięty nieaktualny `apps/frontend/package-lock.json`.
30. ✅ **Brak testów i CI** – najwięcej wartości dałyby testy jednostkowe funkcji obliczeniowych (pit stop, `fuelLaps`, czasy) + GitHub Action z `tsc`, `eslint`, `vite build`. Teraz: vitest (`pnpm test`) + `.github/workflows/ci.yml`.

## Sugerowana kolejność

1. Przenieść konfigurację produkcyjnego backendu na Render do `render.yaml` (Blueprint) – wtedy można bezpiecznie zrobić pkt 14.
