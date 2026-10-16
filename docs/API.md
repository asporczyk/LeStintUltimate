# API

Bazowy URL: `http://localhost:3000/api` (lokalnie). Swagger UI: `http://localhost:3000/docs` (pokazuje parametry i body z `schemas.ts`; schematy odpowiedzi nie są jeszcze opisane).

API celowo nie ma uwierzytelniania – aplikacja jest dostępna dla każdego, kto ma link.

## CORS

Przeglądarki mogą wywoływać API i łączyć się z Socket.IO tylko z dozwolonych domen (`apps/backend/src/cors.ts`):

- `https://le-stint-ultimate.netlify.app` i deploy preview Netlify (`deploy-preview-N--le-stint-ultimate.netlify.app`),
- `https://stint-frontend.onrender.com`,
- `http://localhost:*` i `http://127.0.0.1:*` (development).

Zmienna `CORS_ORIGINS` (lista po przecinku) zastępuje tę listę, np. przy własnej domenie. Socket.IO sprawdza też nagłówek `Origin` przy handshake (`allowRequest`), bo przeglądarki nie stosują CORS do WebSocketów. Zapytania bez nagłówka `Origin` (curl, serwer–serwer) są przepuszczane.

## Walidacja

Każda trasa ma schemat JSON (`apps/backend/src/schemas.ts`):

- parametry `:id` / `:raceId` muszą być 24-znakowym ObjectId → inaczej `400`,
- body jest sprawdzane pod kątem typów i zakresów (np. `raceLength` 0–24, `fuel` 0–100, `notes` ≤ 200, godziny `HH:MM` lub `HH:MM:SS`) → inaczej `400`,
- nieznane pola w body są po cichu usuwane (nie da się nadpisać `_id` ani dopisać własnych pól).

Odpowiedź błędu walidacji: `{ "statusCode": 400, "error": "Bad Request", "message": "body/fuel must be <= 100" }`.

## Wyścigi

| Metoda | Ścieżka | Opis |
|---|---|---|
| `GET` | `/races` | Lista wyścigów (najnowsze pierwsze). Odpowiedź: `{ races, count, limit: 100 }` |
| `POST` | `/races` | Tworzy wyścig. Body: `{ name, startDate }`. `400` gdy osiągnięto limit 100 |
| `GET` | `/races/:id` | Pojedynczy wyścig. `404` gdy brak |
| `PATCH` | `/races/:id` | Częściowa aktualizacja. Emituje `race:updated` |
| `DELETE` | `/races/:id` | Usuwa wyścig razem z harmonogramem, stintami, treningiem i kwalifikacjami |

**Efekty uboczne `PATCH /races/:id`:** zmiana `avgStintTime` ustawia nowy czas stintom z `durationAuto: true` (oraz starym stintom bez flagi, których czas był równy poprzedniej średniej); zmiana `avgStintTime` lub `avgLapTime` przelicza `fuelLaps` i emituje `stint:refresh`.

## Harmonogram i stinty

| Metoda | Ścieżka | Opis |
|---|---|---|
| `GET` | `/schedule/:raceId` | `{ schedule, stints }` – stinty posortowane po `order`, z aktualnym `fuelLaps`. Gdy brak: `{ schedule: null, stints: [] }` |
| `POST` | `/stints` | Dodaje stint do wyścigu `raceId`. Tworzy `Schedule`, jeśli nie istnieje; przesuwa `order` kolejnych stintów o +1 |
| `PUT` | `/stints/:id` | Aktualizuje pola stintu |
| `DELETE` | `/stints/:id` | Usuwa stint; przesuwa `order` kolejnych o −1 |

Po każdej operacji na stintach serwer przelicza `fuelLaps` dla wszystkich stintów harmonogramu (patrz [LOGIKA_OBLICZEN.md](LOGIKA_OBLICZEN.md)) i emituje `stint:refresh` z `{ raceId }`.

Body stintu:

```json
{
  "raceId": "<raceId>",
  "order": 2,
  "duration": 50,
  "durationAuto": true,
  "driver": "Adam",
  "spotter": "Ola",
  "fuelLaps": 0,
  "fuel": 100,
  "tireFL": "N", "tireFR": "N", "tireRL": "-", "tireRR": "-"
}
```

## Trening

| Metoda | Ścieżka | Opis |
|---|---|---|
| `GET` | `/training/:raceId` | `404` gdy brak |
| `POST` | `/training/:raceId` | Body: `{ startTime?, duration? }`. Domyślnie start wyścigu / 30 min. `400` gdy już istnieje |
| `PATCH` | `/training/:raceId` | Emituje `training:updated`. Gdy zmienia się `startTime` lub `duration`, ustawia `Qualification.startTime` = koniec treningu (`HH:MM:SS`) i emituje `qualification:updated` |
| `DELETE` | `/training/:raceId` | Usuwa trening |

## Kwalifikacje

| Metoda | Ścieżka | Opis |
|---|---|---|
| `GET` | `/qualification/:raceId` | `404` gdy brak |
| `POST` | `/qualification/:raceId` | Body: pola modelu `Qualification`. `400` gdy już istnieje |
| `PATCH` | `/qualification/:raceId` | Emituje `qualification:updated` |
| `DELETE` | `/qualification/:raceId` | Usuwa kwalifikacje |

## Zdarzenia Socket.IO

### Serwer → klient

| Zdarzenie | Payload | Źródło |
|---|---|---|
| `race:updated` | pełny `Race` | `PATCH /races/:id` |
| `stint:refresh` | `{ raceId }` | wszystkie operacje na stintach, zmiana `avgStintTime` |
| `training:updated` | pełny `Training` | `PATCH /training/:raceId` |
| `qualification:updated` | pełny `Qualification` | `PATCH /qualification/:raceId`, `PATCH /training/:raceId` |

### Klient → serwer

| Zdarzenie | Payload | Działanie |
|---|---|---|
| `race:join` | `raceId` | Dołącza do pokoju wyścigu – od teraz klient dostaje jego zdarzenia |
| `race:leave` | `raceId` | Opuszcza pokój |

Wszystkie zdarzenia serwer → klient trafiają tylko do pokoju danego wyścigu. Frontend dołącza na stronie wyścigu i ponawia dołączenie po reconnect. Zapisy idą wyłącznie przez REST.
