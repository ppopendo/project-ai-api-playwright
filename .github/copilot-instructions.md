# Instrukcje Copilota — project-ai-api-playwright

## Opis i zakres projektu

Szkoleniowe, **publiczne** repozytorium pokazujące testy API OpenWeatherMap w
**Playwright Test** z użyciem `APIRequestContext`. Zakres: testy API Weather Stations 3.0
(CRUD stacji) oraz Current Weather Data 2.5 (odczyt pogody po mieście) wraz z health checks.
**Nie ma** UI ani testów przeglądarkowych. Kod i identyfikatory po angielsku; dokumentacja,
JSDoc i README po polsku.

## Struktura i odpowiedzialności folderów

- `api/` — `ApiBase` (wspólne metody HTTP, `appid`, timeouty, redakcja) oraz klienci domenowi
  `StationsApi`, `WeatherApi`. Bez asercji i bez danych scenariuszy.
- `config/` — `env.ts`: walidacja konfiguracji i kluczy przed żądaniami.
- `models/` — interfejsy wejść (`CreateStationInput`, `UpdateStationInput`, `WeatherQueryInput`)
  i typy odpowiedzi. Model wejścia ≠ model odpowiedzi.
- `schemas/` — schematy Zod walidujące rzeczywiste odpowiedzi (runtime).
- `factories/` — generowanie poprawnych danych z typowanymi nadpisaniami.
- `test-data/` — stałe, niesekretne scenariusze (miasta, bazowe dane stacji).
- `fixtures/` — typowane fixtures klientów i rejestru zasobów.
- `helpers/` — `redact.ts`, `resource-registry.ts`, `preconditions.ts`.
- `tests/health|stations|weather/` — testy live.
- `docs/api-contract.md` — zweryfikowany kontrakt.

## Komendy instalacji i weryfikacji

- Instalacja: `npm ci` (API-only — bez instalacji przeglądarek).
- Statyczna weryfikacja (bez sekretów): `npm run lint`, `npm run typecheck`,
  `npm run format:check`.
- Live: `npm run test:health`, `npm run test:stations`, `npm run test:weather`,
  `npm run test:live`.

## Standard TypeScript, dokumentacja i asercje

- TypeScript `strict`. **Zakaz** `any`, szerokich rzutowań i globalnego mutowalnego stanu.
- Każda klasa i metoda (także fabryki/helpery publiczne) ma **JSDoc po polsku**: cel, argumenty,
  wynik, istotne efekty uboczne/błędy. Operacje usuwania opisują zasady bezpieczeństwa.
- Walidacja odpowiedzi przez **schematy**, nie przez rzutowanie `response.json() as T`.
  Rozdziel odczyt ciała od walidacji; nie parsuj pustego ciała jako JSON.
- Asercje sprawdzają status **oraz** schemat **oraz** sens biznesowy (tożsamość, zapisane pola).
  Nie sprawdzaj tylko `response.ok()` ani samego statusu; nie akceptuj kilku statusów „na wszelki
  wypadek”. Nie asercjonuj zmiennych wartości (temperatura, opis, liczba stacji na koncie).
- **Jeden test = jedna asercja.** Każdy test kończy się dokładnie jednym `expect`. Gdy trzeba
  sprawdzić wiele wartości, zbuduj obiekt `actual` (wartości rzeczywiste) i obiekt `expected`
  (wartości oczekiwane) jako pary klucz:wartość i porównaj je jednym `expect(actual).toEqual(expected)`.
  Walidacja struktury/typów przez schemat Zod (`parse`) nie jest asercją biznesową i jest dozwolona.
- **Bez logiki w testach.** Testy nie zawierają warunków (`if`, `?.`, operatorów logicznych),
  pętli (`for`, `.map`, `.find`) ani generowania przypadków pętlą. Taką logikę przenieś do
  helpera (`helpers/`) i wywołaj ją w teście. Przypadki „parametryzowane” zapisuj jako osobne,
  jawne testy z unikalnymi ID.

## Unikalne identyfikatory testów

- Każdy test (również health i pomocniczy) ma stały, unikalny ID w tytule (np. `ST-CRT-001`,
  `WE-GET-001`, `HC-ST-001`). Dla przypadków parametryzowanych ID jest unikalny per przypadek.
  **Nie** generuj ID losowo.

## Fixtures, izolacja, health gate i cleanup

- Każdy test CRUD przygotowuje własne preconditions przez fixture/helper; nie zależy od
  kolejności ani sukcesu innych testów.
- Rejestruj ID stacji **natychmiast** po utworzeniu (przed dalszymi asercjami).
- Sprzątanie w teardown/`finally`, także po błędzie; usuwaj **wyłącznie** zasoby zarejestrowane
  przez bieżący test/probe. 404 w cleanup jest idempotentne; inne błędy muszą być widoczne.
- Health checks są bramką: `health-stations` → `stations`, `health-weather` → `weather`.
  Nieudany health blokuje zależny projekt i daje kod niezerowy. **Nie** dodawaj flag omijających
  bramkę w skryptach live/CI.

## Credentials Access

- Nazwa zmiennej/Secret: `OPENWEATHER_API_KEY` — jeden klucz dla obu usług (cele szkoleniowe).
- Klucz pochodzi wyłącznie ze zmiennych środowiskowych: lokalnie z `.env` (ignorowany przez git),
  w CI z GitHub Actions Secrets. Dostęp zapewnia **właściciel repozytorium/konta szkoleniowego**.
- **Nigdy** nie wyświetlaj, nie loguj ani nie commituj wartości klucza. Nie odczytuj lokalnych
  sekretów w celu pokazania ich użytkownikowi ani zapisania w dokumentacji.
- `appid` może wyciec przez URL/query string/nagłówki — diagnostyka musi być redagowana
  (`helpers/redact.ts`). Trace Playwrighta jest wyłączony; nie publikuj surowych żądań/trace.

## Zakazy domenowe

- **Zakaz** operacji na cudzych stacjach — nie usuwaj zasobów, których nie utworzył bieżący test.
  Nigdy nie czyść całego konta.
- **Zakaz** zgadywania kontraktu — przed implementacją potwierdź endpointy, statusy i pola
  w dokumentacji lub obserwacji środowiska i zapisz je w `docs/api-contract.md`.

## Reguła po zmianie kontraktu

Po każdej zmianie kontraktu API zaktualizuj jednocześnie: `docs/api-contract.md`, modele,
schematy, klientów i testy. Nie dopuszczaj do rozjazdu między kontraktem a testami.
