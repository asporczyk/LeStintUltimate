# API

Bazowy URL: `http://localhost:3000/api` (lokalnie). Swagger UI: `http://localhost:3000/docs` (trasy nie mają jeszcze schematów, więc dokumentacja Swaggera jest szczątkowa).

API nie ma uwierzytelniania – każdy, kto zna adres, może czytać i modyfikować dane.

## Wyścigi

| Metoda | Ścieżka | Opis |
|---|---|---|
| `GET` | `/races` | Lista wyścigów (najnowsze pierwsze). Odpowiedź: `{ races, count, limit: 100 }` |
| `POST` | `/races` | Tworzy wyścig. Body: `{ name, startDate }`. `400` gdy osiągnięto limit 100 |
| `GET` | `/races/:id` | Pojedynczy wyścig. `404` gdy brak |
| `PATCH` | `/races/:id` | Częściowa aktualizacja. `400` gdy `notes` > 200 znaków. Emituje `race:updated` |
| `DELETE` | `/races/:id` | Usuwa wyścig (bez kaskady – patrz [REKOMENDACJE.md](REKOMENDACJE.md)) |

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
| `race:updated` | pełny `Race` | `PATCH /races/:id`, socket `race:update` |
| `stint:refresh` | `{ raceId }` | wszystkie operacje na stintach, zmiana `avgStintTime` |
| `training:updated` | pełny `Training` | `PATCH /training/:raceId` |
| `qualification:updated` | pełny `Qualification` **lub** `{ raceId, startTime }` | `PATCH /qualification/:raceId`, `PATCH /training/:raceId` |
| `stint:locked` / `stint:unlocked` / `stint:updated` / `stint:lock:denied` | stint / id | handlery blokad w `socket.ts` |
| `presence:update` | – | rozłączenie klienta |

### Klient → serwer (zaimplementowane na serwerze, nieużywane przez frontend)

| Zdarzenie | Payload | Działanie |
|---|---|---|
| `stint:lock` | `stintId` | Blokuje stint dla danego socketu |
| `stint:update` | `{ stintId, patch }` | Aktualizuje zablokowany stint |
| `stint:unlock` | `stintId` | Zdejmuje blokadę |
| `race:update` | `{ raceId, patch }` | Aktualizuje wyścig bez walidacji |

Przy rozłączeniu serwer zdejmuje wszystkie blokady danego socketu.
