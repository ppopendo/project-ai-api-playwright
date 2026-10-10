# project-ai-api-playwright

Szkoleniowe repozytorium pokazujące **testy API OpenWeatherMap** z użyciem **Playwright Test**
i `APIRequestContext` w **TypeScript** (tryb `strict`). Projekt jest API-only — nie zawiera UI
ani testów przeglądarkowych. Kod i identyfikatory są po angielsku, a dokumentacja i JSDoc po
polsku, aby materiał był zrozumiały dla osób uczących się automatyzacji API.

> ⚠️ **Ostrzeżenie:** Live suite tworzy i usuwa **prawdziwe** stacje na koncie szkoleniowym
> OpenWeatherMap oraz zużywa limit API. Używaj dedykowanego konta/klucza szkoleniowego i
> wyłącznie syntetycznych danych.

## Cel szkoleniowy i zakres

Pokazujemy, jak zbudować czytelny, bezpieczny zestaw testów API:

- **Weather Stations API 3.0** — CRUD stacji: utworzenie, odczyt po ID, lista, aktualizacja,
  usunięcie (+ przypadki negatywne).
- **Current Weather Data API 2.5** — odczyt aktualnej pogody po nazwie miasta (+ przypadek
  negatywny).
- **Health checks** jako bramka gotowości obu usług (autoryzacja i rzeczywista zdolność
  wykonania zależnych testów).

## Przepływ: request → klient → test

```
test (asercje: status + schemat Zod + sens biznesowy)
  └── klient domenowy (StationsApi / WeatherApi)  — metody domenowe, bez asercji
        └── ApiBase (APIRequestContext)           — appid, parametry, timeout, redakcja
              └── OpenWeatherMap API (HTTPS)
```

Odpowiedź wraca jako znormalizowany obiekt (`status`, `rawBody`, `headers`); test parsuje ciało
(`parseJsonBody`) i waliduje je schematem Zod — interfejs TypeScript nie waliduje JSON w runtime.

## Struktura projektu

```
api/           ApiBase + klienci StationsApi, WeatherApi
config/        env.ts — walidacja konfiguracji i kluczy
models/        typy wejść i odpowiedzi (wejście ≠ odpowiedź)
schemas/       schematy Zod walidujące rzeczywiste odpowiedzi
factories/     generowanie poprawnych danych z typowanymi nadpisaniami
test-data/     stałe, niesekretne scenariusze (miasta, bazowe stacje)
fixtures/      typowane fixtures klientów i rejestru zasobów
helpers/       redact, resource-registry, preconditions
tests/
  health/      HC-ST-001, HC-WE-001 (bramka)
  stations/    ST-CRT/GET/LST/UPD/DEL + negatywne
  weather/     WE-GET + negatywny
docs/          api-contract.md — zweryfikowany kontrakt
.github/       workflow CI, copilot-instructions, skill review-api-test
```

## Wymagania

- **Node.js ≥ 20** (projekt testowano na Node 24). Wersja minimalna w `package.json` → `engines`.
- Dostęp do usług OpenWeatherMap z aktywnym kluczem API dla testów live.
- **Koszty i limity:** API ma limity zależne od planu; Weather Stations API 3.0 jest w fazie
  beta. Live suite ogranicza równoległość (`workers: 1`) i nie ponawia operacji mutujących
  (`retries: 0`). Nie aktywuj płatnych usług.

## Konfiguracja

### Lokalnie

1. Zainstaluj zależności: `npm ci`.
2. Skopiuj `.env.example` do `.env` i uzupełnij klucz:

```
OPENWEATHER_API_KEY=...   # jeden klucz dla obu usług (stacje + pogoda)
```

Na potrzeby szkoleniowe używamy jednego klucza `OPENWEATHER_API_KEY` dla obu usług. Plik `.env`
jest ignorowany przez git — **nigdy** nie commituj prawdziwego klucza.

### GitHub Actions Secrets

W repozytorium ustaw sekret: `OPENWEATHER_API_KEY`. Workflow wstrzykuje go wyłącznie do kroku
testów live. Brak sekretu kończy live suite **czytelnym błędem konfiguracji** (nie zielonym
workflow).

Jak uzyskać klucz, uprawnienia, rotacja i postępowanie po wycieku — patrz
[docs/api-contract.md](docs/api-contract.md) oraz
[.github/copilot-instructions.md](.github/copilot-instructions.md) (sekcja _Credentials Access_).
Po podejrzeniu wycieku: zrotuj klucz w panelu OpenWeatherMap i zaktualizuj Secrets/`.env`.

## Uruchamianie

| Komenda                 | Opis                                               |
| ----------------------- | -------------------------------------------------- |
| `npm run test:health`   | Oba health checks (wymaga klucza)                  |
| `npm run test:stations` | CRUD stacji (poprzedzony bramką `health-stations`) |
| `npm run test:weather`  | Testy pogody (poprzedzone bramką `health-weather`) |
| `npm run test:live`     | Pełny live suite: health → stations/weather        |
| `npm run lint`          | ESLint                                             |
| `npm run typecheck`     | `tsc --noEmit`                                     |
| `npm run format:check`  | Sprawdzenie formatowania (Prettier)                |

Health checks są **bramką**: nieudany `health-stations` blokuje `stations`, a `health-weather`
blokuje `weather`; cała komenda kończy się kodem niezerowym. Niezależna usługa nadal może być
testowana.

## Unikalne ID, generowanie danych i sprzątanie

- **Unikalne ID testów.** Każdy test ma stały ID w tytule (np. `ST-CRT-001`, `WE-GET-001`,
  `HC-ST-001`), unikalny również dla każdego przypadku parametryzowanego.
- **Generowanie danych.** Fabryki (`factories/`) tworzą poprawne dane; `external_id` stacji ma
  prefiks `PWTEST-` i unikalny `randomUUID()`. Stałe scenariusze są w `test-data/` — testy nie
  losują oczekiwanych rezultatów ani miast.
- **Sprzątanie.** Rejestr zasobów (`helpers/resource-registry.ts`) usuwa w teardown wyłącznie
  stacje utworzone przez bieżący test/health probe — także po błędzie testu. 404 w cleanup jest
  traktowane idempotentnie; inne błędy są widoczne. Testy **nigdy** nie usuwają cudzych stacji.

## Jak dodać nowy test

1. Zweryfikuj kontrakt operacji w [docs/api-contract.md](docs/api-contract.md) (w razie zmiany
   kontraktu — zaktualizuj modele, schematy i klientów).
2. Dodaj metodę domenową w odpowiednim kliencie (`api/`), jeśli jej brakuje.
3. Dodaj/rozszerz schemat Zod (`schemas/`) i typy (`models/`).
4. W razie potrzeby dodaj fabrykę (`factories/`) lub dane (`test-data/`).
5. Napisz spec w `tests/<obszar>/`, nadaj **unikalny ID** w tytule, użyj fixtures
   (`fixtures/api.fixture.ts`) i rejestruj utworzone zasoby natychmiast po utworzeniu.
6. Asercje: status **+** schemat **+** sens biznesowy (bez zmiennych wartości).
7. Uruchom `npm run lint && npm run typecheck && npm run format:check`, a następnie odpowiedni
   projekt live.

## Skill review-api-test

Repozytorium zawiera skill [.github/skills/review-api-test/SKILL.md](.github/skills/review-api-test/SKILL.md),
który instruuje agenta GitHub Copilot, jak przeprowadzić **review** wskazanego testu API i
powiązanych fixtures/klientów (zgodność z kontraktem, unikalne ID, jakość asercji, izolacja i
cleanup, separacja warstw, bramka health, bezpieczeństwo sekretów). Skill wykonuje review i
zwraca tabelę usterek oraz werdykt (`PASS` / `PASS WITH COMMENTS` / `CHANGES REQUIRED`) — **nie**
modyfikuje kodu automatycznie.

Przykładowe polecenie review w czacie Copilota:

> Użyj skilla review-api-test, aby zrecenzować test `tests/stations/update.spec.ts` wraz z jego
> fixtures i klientem StationsApi.

## Troubleshooting

| Objaw                                   | Przyczyna i rozwiązanie                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ConfigError: Brak klucza API`          | Ustaw `OPENWEATHER_API_KEY` w `.env` (lokalnie) lub w GitHub Secrets (CI).               |
| Health check zwraca 401                 | Nieprawidłowy/nieaktywny klucz lub brak uprawnień do danej usługi — sprawdź panel OWM.   |
| 429 / limit przekroczony                | Przekroczony limit planu — ogranicz liczbę uruchomień; live używa `workers: 1`.          |
| 5xx / brak odpowiedzi                   | Chwilowa niedostępność usługi — ponów później; health gate zablokuje zależne testy.      |
| Pozostała stacja `PWTEST-...` na koncie | Rzadki efekt przerwanego cleanup — usuń ręcznie **wyłącznie** stacje z prefiksem PWTEST. |

## Bezpieczeństwo (repozytorium publiczne)

- Klucze wyłącznie ze zmiennych środowiskowych; `.env` ignorowany, śledzony jest tylko
  `.env.example` z pustymi placeholderami.
- `appid` może wyciec przez URL/logi — diagnostyka jest redagowana (`helpers/redact.ts`), a
  `trace` Playwrighta jest wyłączony. Nie publikujemy surowych żądań/trace do artefaktów.
- Endpointy ograniczone do zaufanych hostów HTTPS OpenWeatherMap (walidacja w `config/env.ts`).

## Ograniczenia weryfikacji

Kontrakt API został potwierdzony obserwacją rzeczywistego środowiska 2026-10-10 (patrz
[docs/api-contract.md](docs/api-contract.md)). Weather Stations API 3.0 jest w fazie beta —
zachowania mogą się zmienić; po zmianie kontraktu zaktualizuj dokument, modele, schematy i testy.
