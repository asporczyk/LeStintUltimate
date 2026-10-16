# Logika obliczeń

Opis reguł domenowych, które aplikacja stosuje przy planowaniu wyścigu. Wszystkie czasy są „zegarowe” (`HH:MM` / `HH:MM:SS`) i zawijają się po północy (`% 24`); data wyścigu (`startDate`) nie bierze udziału w obliczeniach.

## 1. Trening → Kwalifikacje → Wyścig

| Etap | Start | Koniec |
|---|---|---|
| Trening | `Training.startTime` (domyślnie start wyścigu) | start + `duration` |
| Kwalifikacje | koniec treningu (ustawiane przez backend przy `PATCH /training`) | start + `duration` + **1 okrążenie** (`avgLapTime`) |
| Wyścig | koniec kwalifikacji + **2 min** (zaokrąglone do pełnej minuty) | – |

Jeśli kwalifikacje nie istnieją, tabela stintów startuje od `Race.startTime`.

Źródła: `utils/time.ts` (`addMinutesToClock`, frontend), `QualificationSchedule.tsx` (`calculatedRaceStartTime`), `calculations.ts` + `training.routes.ts` (backend). Wszystkie godziny są zaokrąglane do pełnych sekund.

## 2. Kwalifikacje – okrążenia, paliwo, opony

- **Okrążenia:** `ceil(duration * 60 / avgLapTime)` – niepełne okrążenie liczone jako pełne.
- **Paliwo:** `ceil(qualification.laps * avgFuelPerLap)` [%] – liczone z pola `laps` zapisanego w kwalifikacjach, a nie z wyliczonych okrążeń.
- **Opony:** w kwalifikacjach zakładany jest nowy komplet; do wyścigu zostaje `max(0, tireSets − 4)` opon.

## 3. Okrążenie startu stintu (`fuelLaps`)

Okrążenie, od którego zaczyna się stint = liczba pełnych okrążeń przejechanych we **wszystkich wcześniejszych** stintach. Stint #1 zaczyna się na okrążeniu 0.

```
fuelLaps(stint #n) = floor( (duration_1 + … + duration_{n−1}) * 60 / avgLapTime )
```

- Okrążenia liczone są z **łącznego** czasu wcześniejszych stintów, więc zaokrąglenia się nie kumulują (2 × 40 min przy 225,5 s → 21, a nie 10 + 10 = 20).
- Czas trwania samego stintu nie wpływa na jego okrążenie startu.
- Czas pit stopów nie jest wliczany.
- `avgLapTime` domyślnie 120 s, gdy wyścig go nie ma.

Liczone na backendzie (`computeFuelLaps` w `calculations.ts`, `services/stints.ts`) po każdej zmianie stintów, po zmianie `avgLapTime` lub `avgStintTime` wyścigu i przy każdym odczycie harmonogramu (to migruje stare dane). Frontend pokazuje tę samą wartość w modalach (`utils/laps.ts`).

## 3a. Automatyczny czas stintu (`durationAuto`)

Nowy stint ma czas wypełniony średnią z wyścigu (`avgStintTime`). Jeśli zostanie zapisany z tą wartością, dostaje `durationAuto: true`. Ręczna zmiana czasu w edycji ustawia `durationAuto: false`.

Zmiana `avgStintTime` wyścigu aktualizuje czas **tylko** stintów z `durationAuto: true`. Stinty zapisane przed wprowadzeniem flagi (bez pola) są traktowane jak automatyczne, jeśli ich czas był równy poprzedniej średniej.

## 4. Czas pit stopu

`calculatePitstopTime(previous, current, fuelTankCapacity)` w `utils/pitstop.ts` (testy: `utils/pitstop.test.ts`). Model odwzorowuje parametry LMU:

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

Start wyścigu jako konkretny moment (`utils/raceClock.ts`):

```
startDnia   = startDate (data) + race.startTime (godzina startu dnia / treningu)
startWyścigu = startDnia + ((godzinaStartuWyścigu − race.startTime) mod 24 h)
```

`godzinaStartuWyścigu` to start po treningu i kwalifikacjach (sekcja 1). Jeśli trening i kwalifikacje kończą się po północy (np. start dnia 23:30, wyścig 00:40), wyścig wypada **następnego dnia**. Stinty, które trwają przez północ, działają same, bo czas liczony jest w minutach od tego momentu.

Co minutę `StintSchedule` liczy minuty od startu wyścigu. Stint jest aktywny, gdy `start_i ≤ teraz < koniec_i`. Przed startem (i w inne dni) żaden stint nie jest aktywny.

Data jest przechowywana jako północ UTC wybranego dnia, więc dzień odczytywany jest w UTC.

## 7. Pozostałe opony

```
opony_i = (tireSets − 4) − Σ_{k≤i} liczba_zmienionych_opon_k
```

Opona jest „zmieniona”, gdy pole ma wartość inną niż `'-'`.

## 8. Podsumowanie kierowców

Suma `duration` wszystkich stintów danego kierowcy (bez czasu pit stopów), sortowana malejąco, format `H:MM`.
