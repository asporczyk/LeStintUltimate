# Logika obliczeń

Opis reguł domenowych, które aplikacja stosuje przy planowaniu wyścigu. Godziny treningu i kwalifikacji są „zegarowe” (`HH:MM` / `HH:MM:SS`) i zawijają się po północy (`% 24`). Czas wyścigu liczony jest w minutach realnego czasu od startu, a godziny zegarowe stintów, mety i dostępności kierowców przeliczane są przez datę wyścigu w lokalnej strefie czasowej, więc zmiana czasu w trakcie wyścigu jest uwzględniona (sekcja 6).

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

### Zmiana czasu (letni/zimowy)

Minuty wyścigu (`T+`) to realny czas, a godziny na kartach to zegar w lokalnej strefie przeglądarki (`clockAt` w `utils/raceClock.ts`): moment startu + minuty, odczytany zegarem. Przykład: 24 h od soboty 24.10.2026 14:00 – o T+13:00 zegar cofa się z 03:00 na 02:00, więc metę pokazuje o 13:00 (a nie 14:00), a stint 02:55–03:45 trwa 110 min. Karta stintu, w którym (lub w pit stopie po którym) zmienia się czas, ma notkę „Zmiana czasu o T+…: 03:00 → 02:00” (`clockChanges`).

Godziny dostępności kierowców to godziny zegarowe, zamieniane na minuty wyścigu przez realny moment (`eventClockDateTime`): niedzielne 08:00 to T+19:00 (bez zmiany czasu byłoby T+18:00). Godzina występująca dwa razy (02:00–02:59 przy cofnięciu zegara) oznacza pierwsze wystąpienie. Lista godzin do wyboru kończy się na mecie według zegara, czyli godzinę wcześniej (cofnięcie) lub później (przestawienie do przodu).

## 7. Pozostałe opony

```
opony_i = (tireSets − 4) − Σ_{k≤i} liczba_zmienionych_opon_k
```

Opona jest „zmieniona”, gdy pole ma wartość inną niż `'-'`.

## 8. Przebieg wyścigu i podsumowanie kierowców

Pod harmonogramem jest jeden widok: pasek wyścigu (stinty w kolorach kierowców; kolejne stinty tego samego kierowcy tworzą jeden blok, inaczej pit stopy są przerwami; niezaplanowany czas jest zakreskowany) i tabela kierowców w tych samych kolorach.

Czas kierowcy to suma czasu jego stintów tak, jak zostaną przejechane: stint na metę liczy się do flagi, a stinty po mecie się nie liczą (bez czasu pit stopów). Sortowanie malejąco, format `H:MM`. Procent liczony jest od końca ostatniego przejechanego stintu (z pit stopami).

## 9. Meta i oś czasu wyścigu

Liczone w `utils/raceTimeline.ts` (testy: `utils/raceTimeline.test.ts`). Czasy w minutach od startu wyścigu.

- **Czas mija** po `raceLength` godzinach. Okrążenia liczone są z czasu jazdy (bez pit stopów), tak jak okrążenie startu stintu (sekcja 3).
- **Flaga w szachownicę**: wyścig na czas kończy się po okrążeniu, w trakcie którego minął czas. `totalLaps = floor(jazda_w_chwili_końca * 60 / avgLapTime) + 1`, a flaga pada, gdy czas jazdy osiągnie `totalLaps * avgLapTime`. Jeśli plan kończy się wcześniej, zakładamy jazdę bez kolejnych pit stopów.
- **Stint na metę**: stint, w którym pada flaga, kończy się razem z nią. Karta pokazuje jego rzeczywisty czas („do mety”), nawet jeśli zapisany czas jest dłuższy.
- **Dokładność planu**: czasy stintów są w pełnych minutach, więc plan kończący się mniej niż minutę przed flagą uznajemy za pełny. Ostatni stint dojeżdża wtedy do flagi i nie da się dodać kolejnego.
- **Stinty po mecie**: stinty zaczynające się po fladze są wyszarzone i oznaczone na osi. Karta mety podpowiada, żeby je usunąć albo skrócić wcześniejsze.
- **Godziny wyścigu**: na osi przy kartach każda pełna godzina jest pokazana w stincie, w którym mija, razem z godziną zegarową i okrążeniem (w podpowiedzi).

Limity w modalach:

- Gdy plan sięga flagi, nie da się dodać nowego stintu (znikają przyciski „+”).
- Nowy stint może trwać najwyżej do flagi, licząc pit stop przed nim (zmiana kierowcy, pełny bak): `ceil(flaga − koniec_planu − pit_stop)`.
- Stint, w którym pada flaga, oraz ostatni stint mogą trwać najwyżej do flagi. Wcześniejsze stinty mogą się wydłużyć o czas, który plan jeszcze ma wolny; przy pełnym planie nie mają limitu, a skraca się stint na metę.

Paliwo na ostatni stint: gdy stint dojeżdża do flagi (jego czas równa się limitowi „do mety”), modal dodawania i edycji proponuje najmniejsze tankowanie, które wystarczy do mety, i nie pozwala ustawić więcej. Dotyczy nowego stintu dodawanego na końcu oraz edycji stintu na metę (albo ostatniego stintu):

```
okrążenia = ceil(totalLaps − czas_jazdy_przed_stintem * 60 / avgLapTime)   // zaczęte okrążenie liczy się w całości
paliwo    = min(100, ceil((okrążenia + 1) * avgFuelPerLap))         // +1 okrążenie zapasu
```

Krótszy stint zdejmuje limit i wraca pełny bak. Bez `avgFuelPerLap` nic nie jest proponowane (`finishFuel` w `utils/raceTimeline.ts`).

Model nie uwzględnia straty czasu na przejazd przez aleję serwisową (tylko postój z sekcji 4).
