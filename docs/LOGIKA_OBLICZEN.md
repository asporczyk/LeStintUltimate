# Logika obliczeń

Opis reguł domenowych, które aplikacja stosuje przy planowaniu wyścigu. Wszystkie czasy są „zegarowe” (`HH:MM` / `HH:MM:SS`) i zawijają się po północy (`% 24`); data wyścigu (`startDate`) nie bierze udziału w obliczeniach.

## 1. Trening → Kwalifikacje → Wyścig

| Etap | Start | Koniec |
|---|---|---|
| Trening | `Training.startTime` (domyślnie start wyścigu) | start + `duration` |
| Kwalifikacje | koniec treningu (ustawiane przez backend przy `PATCH /training`) | start + `duration` + **1 okrążenie** (`avgLapTime`) |
| Wyścig | koniec kwalifikacji + **2 min** (zaokrąglone do pełnej minuty) | – |

Jeśli kwalifikacje nie istnieją, tabela stintów startuje od `Race.startTime`.

Źródła: `TrainingSchedule.tsx` (`formatEndTime`), `QualificationSchedule.tsx` (`calculatedRaceStartTime`), `training.routes.ts`.

## 2. Kwalifikacje – okrążenia, paliwo, opony

- **Okrążenia:** `ceil(duration * 60 / avgLapTime)` – niepełne okrążenie liczone jako pełne.
- **Paliwo:** `ceil(qualification.laps * avgFuelPerLap)` [%] – liczone z pola `laps` zapisanego w kwalifikacjach, a nie z wyliczonych okrążeń.
- **Opony:** w kwalifikacjach zakładany jest nowy komplet; do wyścigu zostaje `max(0, tireSets − 4)` opon.

## 3. Okrążenie pit stopu (`fuelLaps`)

Liczone na backendzie (`schedule.routes.ts`) po każdej zmianie w stintach:

```
fuelLaps(stint #1) = 0
fuelLaps(stint #n) = fuelLaps(stint #n−1) + floor(duration_n * 60 / avgLapTime)
```

`avgLapTime` domyślnie 120 s, gdy wyścig go nie ma. Kolumna w tabeli nazywa się „okrążenie pit stopu”.

> Formuła używa czasu trwania **bieżącego** stintu, a pierwszy stint zawsze ma 0 – warto zweryfikować, czy to zamierzone (patrz [REKOMENDACJE.md](REKOMENDACJE.md)).

## 4. Czas pit stopu

`calculatePitstopTime(previous, current, fuelTankCapacity)` w `hooks/usePitstopTime.ts`. Model odwzorowuje parametry LMU:

| Składnik | Wzór |
|---|---|
| Tankowanie | `((fuel − 1) / 100 * capacity) / 3.0 L/s + 2.0 + 1.2 + 0.7` s |
| Opony | 1–2 opony: `15 + 7` s, 3–4 opony: `32 + 7` s, 0 opon: 0 |
| Zmiana kierowcy | `40 + 6` s, gdy `driver` różni się od poprzedniego stintu |

Tankowanie i opony są **równoległe** (`max`), zmiana kierowcy również równoległa z resztą (`max`). Pierwszy stint nie ma pit stopu.

Założenie: `fuel` to procent zbiornika dolewany w pit stopie, przy prawie pustym baku (−1 %).

## 5. Czasy stintów w tabeli

Dla stintu o indeksie `i`:

```
start_i = Σ_{k<i} ( duration_k + pitstop(k, k+1) / 60 )   [min od startu wyścigu]
koniec_i = start_i + duration_i
```

Wyświetlane jako `startWyścigu + start_i` w formacie `HH:MM:SS`.

## 6. Aktywny stint

`StintSchedule` co 60 s liczy, ile minut minęło od dzisiejszego `startTime` (jeśli godzina startu jest jeszcze w przyszłości – od wczorajszej, żeby wyścig trwający przez północ działał poprawnie). Stint jest aktywny, gdy `start_i ≤ teraz < koniec_i` – wiersz jest podświetlony, a przy kierowcy pojawia się wskaźnik.

## 7. Pozostałe opony

```
opony_i = (tireSets − 4) − Σ_{k≤i} liczba_zmienionych_opon_k
```

Opona jest „zmieniona”, gdy pole ma wartość inną niż `'-'`.

## 8. Podsumowanie kierowców

Suma `duration` wszystkich stintów danego kierowcy (bez czasu pit stopów), sortowana malejąco, format `H:MM`.
