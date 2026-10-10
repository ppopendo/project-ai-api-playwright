# Zweryfikowany kontrakt API OpenWeatherMap

**Źródła dokumentacji:**

- Katalog API: https://openweathermap.org/api
- Weather Stations API 3.0 (beta): https://openweathermap.org/api/stations
- Current Weather Data 2.5: https://openweathermap.org/api/current

**Data weryfikacji:** 2026-10-10

**Metoda weryfikacji:** Dokumentacja OpenWeatherMap jest renderowana po stronie klienta i
nie udostępnia pełnych szczegółów endpointów przez proste pobranie HTML. Kontrakt poniżej
został potwierdzony **obserwacją rzeczywistego środowiska** — wykonaniem autoryzowanych
żądań do żywego API przy użyciu szkoleniowego klucza (operacje odczytu oraz izolowany,
mutujący i posprzątany probe create/read/update/delete). Każda pozycja jest oznaczona jako
_potwierdzone środowiskiem_ (E) lub _z dokumentacji_ (D).

> Uwaga: Weather Stations API 3.0 jest w fazie **beta**. Zachowania mogą ulec zmianie —
> po każdej zmianie kontraktu należy zaktualizować ten dokument oraz testy i schematy.

## Uwierzytelnianie

- Klucz API przekazywany jako parametr zapytania `appid` (E, D).
- Transport wyłącznie przez HTTPS (D). Bazowy host: `api.openweathermap.org` (E).
- **Ryzyko wycieku:** `appid` jest częścią query string, więc może trafić do logów, URL-i i
  artefaktów. Wymagana redakcja (patrz `helpers/redact.ts`).

## Weather Stations API 3.0 — zarządzanie stacjami

Ścieżka bazowa: `/data/3.0/stations`

| Operacja         | Metoda i ścieżka                 | Status (E) | Źródło |
| ---------------- | -------------------------------- | ---------- | ------ |
| Lista stacji     | `GET /data/3.0/stations`         | 200        | E      |
| Utworzenie       | `POST /data/3.0/stations`        | 201        | E      |
| Odczyt po ID     | `GET /data/3.0/stations/{id}`    | 200        | E      |
| Aktualizacja     | `PUT /data/3.0/stations/{id}`    | 200        | E      |
| Usunięcie        | `DELETE /data/3.0/stations/{id}` | 204        | E      |
| Odczyt usuniętej | `GET /data/3.0/stations/{id}`    | 404        | E      |

### Utworzenie (`POST`)

Ciało żądania (JSON):

```json
{
  "external_id": "PWTEST-...",
  "name": "string",
  "latitude": 52.2297,
  "longitude": 21.0122,
  "altitude": 100
}
```

Odpowiedź **201** — uwaga na konwencję nazwy identyfikatora: pole `ID` **wielkimi literami**
oraz dodatkowe pola serwerowe `user_id`, `source_type`:

```json
{
  "ID": "6aca1140adde3b0001344ab5",
  "created_at": "2026-10-10T10:19:44.348844769Z",
  "updated_at": "2026-10-10T10:19:44.348844592Z",
  "user_id": "5be6f508b58a460008d84002",
  "external_id": "PWTEST-...",
  "name": "...",
  "latitude": 52.2297,
  "longitude": 21.0122,
  "altitude": 100,
  "rank": 10,
  "source_type": 5
}
```

### Odczyt / lista / aktualizacja

Odpowiedź (200) używa pola identyfikatora `id` **małymi literami** (inaczej niż `POST`), bez
pól `user_id`/`source_type`:

```json
{
  "id": "6aca1140adde3b0001344ab5",
  "created_at": "2026-10-10T10:19:44.348Z",
  "updated_at": "2026-10-10T10:19:44.348Z",
  "external_id": "PWTEST-...",
  "name": "...",
  "longitude": 21.0122,
  "latitude": 52.2297,
  "altitude": 100,
  "rank": 10
}
```

- **Lista** zwraca tablicę takich obiektów. Konto może zawierać stacje innych testów/użytkownika
  — nie zakładać pustego konta i nie usuwać cudzych zasobów.
- **Aktualizacja (`PUT`)** ma semantykę **pełnego zastąpienia** zasobu — wymaga kompletu pól.
  Obserwacja (E): pominięcie pola `rank` powoduje jego wyzerowanie. `external_id` zostaje
  zachowany, jeśli jest przekazany ponownie.

### Usunięcie (`DELETE`)

- Status **204**, **puste ciało** (E).
- Ponowny odczyt usuniętej stacji → **404** (E).
- Usunięcie nieistniejącej stacji → **404** (E) — można traktować jako idempotentne w cleanup.

### Przypadki błędne (E)

| Scenariusz                        | Status | Ciało                                                                |
| --------------------------------- | ------ | -------------------------------------------------------------------- |
| Odczyt/usunięcie nieistniejącej   | 404    | `{"code":404001,"message":"Station not found"}`                      |
| `latitude` poza zakresem (-90:90) | 400    | `{"code":400001,"message":"Station latitude should be in (-90:90)"}` |
| Brak/zerowa nazwa stacji          | 400    | `{"code":400001,"message":"Bad or zero length station name"}`        |

## Current Weather Data API 2.5 — aktualna pogoda

Ścieżka: `/data/2.5/weather`

| Operacja                | Metoda i ścieżka                          | Status (E) |
| ----------------------- | ----------------------------------------- | ---------- |
| Pogoda po nazwie miasta | `GET /data/2.5/weather?q={miasto},{kraj}` | 200        |
| Nieznane miasto         | `GET /data/2.5/weather?q={nieznane}`      | 404        |

- Parametr `q` przyjmuje `miasto` lub `miasto,kodKraju` (E). Wyszukiwanie po nazwie miasta
  jest **nadal wspierane** (E) — nie jest wymagane osobne geokodowanie.
- Parametr `units` (`standard`/`metric`/`imperial`) wpływa na jednostki (D, E).
- Parametr `lang` ustawia język opisów (D).

Odpowiedź (200), pola istotne dla kontraktu (E):

```json
{
  "coord": { "lon": -0.1257, "lat": 51.5085 },
  "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04d" }],
  "main": {
    "temp": 13.73,
    "feels_like": 12.86,
    "temp_min": 12.78,
    "temp_max": 15.03,
    "pressure": 1013,
    "humidity": 65
  },
  "wind": { "speed": 7.2, "deg": 260 },
  "sys": { "country": "GB", "sunrise": 1791612930, "sunset": 1791652758 },
  "id": 2643743,
  "name": "London",
  "cod": 200
}
```

API zwraca więcej pól (`base`, `visibility`, `clouds`, `dt`, `timezone`, …), które nie są
przedmiotem asercji. Schemat pogody nie jest `strict()`.

### Przypadek błędny (E)

| Scenariusz      | Status | Ciało                                      |
| --------------- | ------ | ------------------------------------------ |
| Nieznane miasto | 404    | `{"cod":"404","message":"city not found"}` |

Uwaga: w błędzie pogody pole `cod` jest **tekstem** (`"404"`), a w odpowiedzi poprawnej —
**liczbą** (`200`). Schematy uwzględniają tę różnicę.

## Ograniczenia i uwagi

- Weather Stations API 3.0 jest w fazie beta — kontrakt może się zmienić (D).
- Limity zapytań zależą od planu konta (D). Testy live ograniczają równoległość (`workers: 1`)
  i nie ponawiają operacji mutujących (`retries: 0`), aby nie multiplikować żądań.
- Brak uprawnień/nieaktywny klucz, przekroczenie limitu i niedostępność usługi muszą być
  rozróżniane po statusie i ciele — nie wolno zamieniać ich na sukces ani ciche `skip`.
- Dokumentacja jest niepełna w zakresie dokładnych limitów długości pól stacji — fabryka
  stosuje defensywne ograniczenie długości `external_id` do 64 znaków. W razie potrzeby
  doprecyzować po stronie właściciela konta.
