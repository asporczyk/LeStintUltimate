# API

Bazowy URL: `http://localhost:3000/api` (lokalnie). Swagger UI: `http://localhost:3000/docs` (pokazuje parametry i body z `schemas.ts`; schematy odpowiedzi nie są jeszcze opisane).

API nie ma uwierzytelniania – każdy, kto zna adres, może czytać i modyfikować dane.

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
| `PATCH` | `/races/:id` | Częściowa aktualizacja. `400` gdy `notes` > 200 znaków. Emituje `race:updated` |
| `DELETE` | `/races/:id` | Usuwa wyścig razem z harmonogramem, stintami, treningiem i kwalifikacjami |

**Efekt uboczny `PATCH /races/:id`:** jeśli zmienia się `avgStintTime`, wszystkie stinty, których `duration` było równe **staremu** `avgStintTime`, dostają nową wartość; emitowane jest `stint:refresh`.

## Harmonogram i stinty

| Metoda | Ścieżka | Opis |
|---|---|---|
| `GET` | `/schedule/:raceId` | `{ schedule, stints }` – stinty posortowane po `order`. Gdy brak: `{ schedule: null, stints: [] }` |
| `POST` | `/stints` | Dodaje stint. **Pole `scheduleId` w body to w rzeczywistości `raceId`.** Tworzy `Schedule`, jeśli nie istnieje; przesuwa `order` kolejnych stintów o +1 |
| `PUT` | `/stints/:id` | Aktualizuje pola stintu |
| `DELETE` | `/stints/:id` | Usuwa stint; przesuwa `order` kolejnych o −1 |

Po każdej operacji na stintach serwer przelicza `fuelLaps` dla wszystkich stintów harmonogramu (patrz [LOGIKA_OBLICZEN.md](LOGIKA_OBLICZEN.md)) i emituje `stint:refresh` z `{ raceId }`.

Body stintu:

```json
{
  "scheduleId": "<raceId>",
  "order": 2,
  "startTime": 0,
  "duration": 50,
  "driver": "Adam",
  "spotter": "Ola",
  "fuelLaps": 0,
  "fuel": 100,
  "tireFL": "N", "tireFR": "N", "tireRL": "-", "tireRR": "-",
  "tires": 10
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

Brak. Socket.IO służy wyłącznie do rozgłaszania zmian; wszystkie zapisy idą przez REST.
