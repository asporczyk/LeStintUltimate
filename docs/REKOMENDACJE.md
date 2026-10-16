# Rekomendacje poprawek

Wynik przeglądu kodu z 2026-10-16. Pogrupowane wg priorytetu. `tsc` przechodzi w obu aplikacjach, `eslint` we frontendzie zgłasza 16 błędów.

✅ = naprawione na branchu `fix/review-bugs`.

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

### 7. Brak uwierzytelniania + `CORS: *`
Każdy, kto zna URL backendu, może usunąć wszystkie wyścigi (`DELETE /races/:id`) lub nadpisać dowolne pole przez socket `race:update`. Minimum: prosty klucz zespołu / link z tokenem, ograniczenie CORS do domeny Netlify.

### ✅ 8. Niewalidowane patche
**Stan:** wszystkie trasy mają schematy w `apps/backend/src/schemas.ts` (params z walidacją ObjectId, body z zakresami wartości); nieznane pola są usuwane przez Ajv. Nieużywane handlery socketowe i pole `lockedBy` usunięte. Schematy nie mają jeszcze opisów odpowiedzi, więc Swagger pokazuje tylko wejście.

`PATCH /races/:id`, `PATCH /qualification`, socket `race:update` i `stint:update` przyjmują dowolny obiekt i wykonują `$set` / `Object.assign`. Można dopisać dowolne pola lub nadpisać `_id`/`lockedBy`.
**Poprawka:** schematy JSON w Fastify (`schema: { body, params }`) – przy okazji uzupełnią Swagger pod `/docs`. Nieużywane handlery socketowe (`stint:lock/update/unlock`, `race:update`) można usunąć.

### ✅ 9. `apps/backend/.env` jest w repozytorium
Plik jest śledzony w git mimo wpisu `.env` w `.gitignore` (dodany przed regułą). Obecnie zawiera tylko lokalny URI, ale każda przyszła zmiana na URI Atlasa z hasłem trafi do publicznego repo.
**Poprawka:** `git rm --cached apps/backend/.env` + dodać `apps/backend/.env.example`.

## 🟡 Logika domenowa – do weryfikacji

### 10. Formuła `fuelLaps`
Dla stintu #n dodawane są okrążenia **bieżącego** stintu, a stint #1 zawsze ma 0. Jeśli kolumna ma oznaczać „okrążenie, na którym zjeżdżam do pit stopu na końcu tego stintu”, stint #1 powinien mieć `floor(d1*60/lap)`. Do tego nie uwzględnia czasu pit stopów. Warto opisać intencję i dodać test.

### 11. Kaskada `avgStintTime`
Zmiana `avgStintTime` aktualizuje tylko stinty o `duration === staryAvg`. Stinty ręcznie zmienione „przypadkiem” na tę samą wartość też się zmienią; to zachowanie jest nieintuicyjne i niewidoczne dla użytkownika.

### 12. Aktywny stint ignoruje datę wyścigu
`getRaceStartDate` używa tylko godziny. W dniu przed wyścigiem (lub tydzień po) tabela może podświetlać stint jako aktywny. Lepiej liczyć od `startDate + startTime` (i rozwiązuje to też problem północy).

### 13. Niespójne formaty godzin
`Qualification.startTime` bywa `"HH:MM"` (domyślne) albo `"HH:MM:SS"` (po zmianie treningu); trening wyświetla `{startTime}:00`. Warto ujednolicić (np. przechowywać sekundy od północy lub pełny `Date`).

### 14. Czas pit stopu zależy od stintu, którego jeszcze nie ma w obliczeniach serwera
Czas pit stopów liczony jest tylko na froncie, a `fuelLaps` tylko na backendzie. Wspólne funkcje obliczeniowe w `packages/shared` (katalog już istnieje) pozwoliłyby liczyć wszystko w jednym miejscu i pokryć testami.

## 🔵 Jakość kodu

15. **Duplikacja w `schedule.routes.ts`** – pętla przeliczania `fuelLaps` + emit powtórzona 3×. Wydzielić `recalculateFuelLaps(scheduleId)`.
16. **Pole `scheduleId` w `POST /stints` to `raceId`** – mylące; zmienić nazwę na `raceId`.
17. ✅ **`StintSchedule` omijał warstwę `api/`** – teraz używa `ScheduleApi`/`RacesApi` (naprawione razem z pkt 3).
18. **`StintSchedule.tsx` ma 435 linii** – wydzielić `StintRow`, `NotesEditor`, `DriverSummary` oraz funkcje czasu do `utils/time.ts` (`formatEndTime` jest skopiowane w 3 plikach, `CheckIcon` w 2, liczenie zmienionych opon w 4).
19. **`usePitstopTime.ts` to nie hook** – przenieść do `utils/` (konwencja `use*` sugeruje hook). Stałe `CONCURRENT_* = 1.0` tworzą martwe gałęzie.
20. **ESLint: 16 błędów** – głównie `any` w `useSocket.tsx` (brak typów `Training`/`Qualification` w callbackach), `set-state-in-effect`, `only-export-components`, puste interfejsy w `theme.ts`.
21. **i18n** – `lng: 'pl'` wyłącza `LanguageDetector`; daty formatowane na sztywno `toLocaleDateString('pl-PL')`; „Loading...” w `TrainingSchedule`/`QualificationSchedule` nie jest tłumaczone; komunikaty błędów backendu mieszają PL i EN.
22. **Startup backendu** – `Number(process.env.PORT)` daje `NaN` bez zmiennej, `MONGO_URI!` bez sprawdzenia. Dodać walidację env z czytelnym błędem.
23. **Nieużywane pola** – `Stint.startTime` (zawsze 0), `Stint.tires` (UI liczy samodzielnie), `Schedule.version`. (`Stint.lockedBy` usunięte razem z handlerami blokad – pkt 8.)
24. **`Training`/`Qualification` POST nie emitują zdarzeń** – inni użytkownicy nie zobaczą nowo dodanego treningu/kwalifikacji bez odświeżenia.
25. **`io.emit` do wszystkich** – każdy klient dostaje zdarzenia wszystkich wyścigów. Przy większej liczbie użytkowników: pokoje Socket.IO per `raceId`.

## ⚪ Porządki w repo

26. README był nieaktualny (np. `i18n.ts` jako entry point backendu, `App.css`, jeden endpoint) – zaktualizowany razem z tą dokumentacją.
27. `dev_output.log` w roocie (ignorowany przez `*.log`, ale wskazuje na nieistniejący `src/services/StintService.ts`) – można usunąć.
28. `packages/shared` – nieśledzony, zawiera tylko `dist/` i `node_modules/`. Albo go wykorzystać (pkt 14), albo usunąć z `pnpm-workspace.yaml`.
29. `netlify.toml` – `node_bundler` dotyczy sekcji `[functions]`, w `[build]` jest ignorowane. `--no-frozen-lockfile` w CI maskuje rozjazdy lockfile.
30. **Brak testów i CI** – najwięcej wartości dałyby testy jednostkowe funkcji obliczeniowych (pit stop, `fuelLaps`, czasy) + GitHub Action z `tsc`, `eslint`, `vite build`.

## Sugerowana kolejność

1. Pkt 7 – uwierzytelnianie i CORS przed udostępnieniem linku szerzej.
2. Pkt 14, 15, 18, 30 – wspólny moduł obliczeń + testy, potem refaktor `StintSchedule`.
