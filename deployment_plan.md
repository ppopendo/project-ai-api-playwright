# Prompt dla agenta: szkoleniowe repozytorium testów API OpenWeatherMap

## Rola i cel

Jesteś seniorem QA Automation Engineer specjalizującym się w TypeScript, Playwright API Testing i bezpiecznych publicznych repozytoriach szkoleniowych.

Zbuduj kompletne, uruchamialne repozytorium pokazujące tworzenie testów API OpenWeatherMap z użyciem Playwright Test i `APIRequestContext`. Nie buduj interfejsu użytkownika ani testów przeglądarkowych.

To zadanie dotyczy **osobnego projektu szkoleniowego**, nie aplikacji znajdującej się przypadkiem w bieżącym workspace. Przed rozpoczęciem sprawdź katalog docelowy i istniejące instrukcje. Jeśli workspace zawiera niezwiązany projekt, poproś o wskazanie docelowego katalogu; nie nadpisuj jego plików, konfiguracji ani zależności.

Repozytorium będzie publiczne. Kod i nazwy identyfikatorów pisz po angielsku, README, objaśnienia oraz dokumentację klas i metod po polsku. Materiał powinien być zrozumiały dla osoby uczącej się automatyzacji API.

## Zakres funkcjonalny

Zaimplementuj testy:

1. Dodania stacji pogodowej.
2. Aktualizacji stacji pogodowej.
3. Wyszukania/odczytu konkretnej stacji oraz pobrania listy stacji, o ile API to wspiera.
4. Usunięcia stacji pogodowej.
5. Wyszukania aktualnej pogody dla określonego miasta.

Dodaj health checks dla obu używanych usług: zarządzania stacjami oraz aktualnej pogody. Health check ma potwierdzać dostępność, poprawność uwierzytelnienia i rzeczywistą gotowość do wykonania zależnych testów, a nie tylko odpowiedź serwera.

## Najpierw zweryfikuj kontrakt API

Źródła:

- Katalog API: https://openweathermap.org/api
- Weather Stations API: https://openweathermap.org/api/stations
- Current Weather Data: https://openweathermap.org/api/current

Przed implementacją przeczytaj aktualną dokumentację. Nie zgaduj endpointów, kodów odpowiedzi ani wymaganych pól.

Jako punkty wyjścia do weryfikacji potraktuj:

| Operacja            | Metoda i ścieżka do zweryfikowania                                    |
| ------------------- | --------------------------------------------------------------------- |
| Dodanie stacji      | `POST /data/3.0/stations`                                             |
| Lista stacji        | `GET /data/3.0/stations`                                              |
| Odczyt stacji       | `GET /data/3.0/stations/{id}`                                         |
| Aktualizacja stacji | `PUT /data/3.0/stations/{id}`                                         |
| Usunięcie stacji    | `DELETE /data/3.0/stations/{id}`                                      |
| Pogoda dla miasta   | `GET /data/2.5/weather` z parametrem `q`, jeżeli nadal jest wspierany |

Używaj HTTPS. Sprawdź sposób przekazania klucza API, wymagane uprawnienia/subskrypcję, limity, status beta API stacji, semantykę aktualizacji i odpowiedzi po usunięciu.

Jeśli wyszukiwanie pogody po nazwie miasta jest niewspierane, użyj udokumentowanego geokodowania miasta i odczytu pogody po współrzędnych. W takim przypadku uwzględnij dodatkową usługę w klientach, health checks i dokumentacji.

Zapisz zweryfikowany kontrakt w `docs/api-contract.md`: źródło i data weryfikacji, metody, ścieżki, parametry, pola, oczekiwane statusy i ograniczenia. Rozróżniaj dane potwierdzone dokumentacją od obserwacji środowiska. Jeśli dokumentacja jest niepełna, wskaż brak i poproś o decyzję zamiast wymyślać zachowanie.

Brak uprawnień lub odpowiedniego planu nie może prowadzić do fałszywie zielonych testów. Nie kupuj subskrypcji ani nie aktywuj płatnych usług. Nie zamieniaj testów integracyjnych na mocki bez wyraźnego oznaczenia.

## Technologia i struktura

Użyj TypeScript w trybie `strict`, Playwright Test, npm oraz aktualnej wspieranej wersji Node.js zgodnej z wybraną wersją Playwright. Zapisz wersję Node.js i lockfile. Ogranicz zależności do potrzebnych narzędzi; wybierz bibliotekę walidacji kontraktów, np. Zod.

Zachowaj poniższy podział odpowiedzialności:

```text
.
├── .github/
│   ├── workflows/api-tests.yml
│   ├── copilot-instructions.md
│   └── skills/review-api-test/SKILL.md
├── api/
│   ├── ApiBase.ts
│   ├── StationsApi.ts
│   └── WeatherApi.ts
├── config/
│   └── env.ts
├── models/
│   ├── station.models.ts
│   ├── weather.models.ts
│   └── api.models.ts
├── schemas/
│   ├── station.schemas.ts
│   └── weather.schemas.ts
├── factories/
│   ├── station.factory.ts
│   └── weather-query.factory.ts
├── test-data/
│   ├── stations.ts
│   └── cities.ts
├── fixtures/
│   └── api.fixture.ts
├── helpers/
│   ├── resource-registry.ts
│   └── redact.ts
├── tests/
│   ├── health/
│   ├── stations/
│   ├── weather/
│   └── unit/
├── docs/
│   └── api-contract.md
├── .env.example
├── .gitignore
├── playwright.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

Dodaj konfiguracje lintowania i formatowania. Dopuszczalne są dodatkowe pliki, jeśli mają jasno uzasadnioną odpowiedzialność.

### Modele, dane i generatory

- W `models/` umieść interfejsy argumentów wejściowych, np. `CreateStationInput`, `UpdateStationInput`, `StationLookupInput`, `WeatherQueryInput`, oraz potrzebne typy odpowiedzi.
- Typy odpowiedzi muszą odpowiadać dokumentacji; nie utożsamiaj modelu wejściowego z modelem odpowiedzi.
- W `test-data/` zapisz jawne, niesekretne scenariusze: przykładowe miasta z kodem kraju, jednostki, wartości do aktualizacji i bazowe dane stacji.
- W `factories/` umieść generowanie poprawnych danych z możliwością przekazania typowanych nadpisań.
- Dane stacji muszą mieć rozpoznawalny prefiks projektu i unikalny identyfikator, np. oparty na `crypto.randomUUID()`. Uwzględnij ograniczenia długości pól API.
- Rozdziel stałe dane scenariusza od generowanych wartości. Nie losuj oczekiwanych rezultatów ani miast w testach pogodowych.
- Interfejs TypeScript nie waliduje JSON w runtime: używaj schematów do sprawdzania rzeczywistych odpowiedzi.

### ApiBase i klienci usług

- `ApiBase` ma przyjmować wstrzyknięty `APIRequestContext` i udostępniać wspólne, typowane metody `get`, `post`, `put`, `delete`. Dodaj `patch` tylko wtedy, gdy wymaga go zweryfikowany kontrakt.
- Centralizuj obsługę parametrów, uwierzytelnienia, timeoutów oraz bezpiecznej diagnostyki.
- Nie ukrywaj odpowiedzi HTTP 4xx/5xx: testy muszą móc sprawdzić status i ciało. Błędy transportowe mają kończyć wykonanie czytelnym, zredagowanym błędem.
- Nie parsuj pustego body jako JSON. Rozdziel odczyt odpowiedzi od walidacji jej schematu.
- Nie używaj niezweryfikowanego `response.json() as T` jako dowodu zgodności kontraktu.
- Klienci `StationsApi` i `WeatherApi` mają dostarczać metody domenowe. Nie umieszczaj w nich asercji Playwright ani danych scenariuszy.
- Nie używaj `any`, szerokich rzutowań, globalnego mutowalnego stanu ani nadmiernie rozbudowanego frameworka.

### Dokumentacja kodu

Każda klasa i każda metoda, również publiczna funkcja pomocnicza/fabryka, musi mieć czytelny JSDoc po polsku: cel, argumenty, wynik oraz istotne efekty uboczne lub błędy. Przy operacjach usuwania opisz zasady bezpieczeństwa. Unikaj komentarzy powtarzających oczywistą składnię; dokumentacja ma wyjaśniać odpowiedzialność i sposób użycia.

## Fixtures, izolacja i sprzątanie

- W `fixtures/` dostarcz typowane fixtures klientów oraz zasobów stacji.
- Preferuj request context i rejestr zasobów o zakresie testu. Zwolnij context po zakończeniu sprzątania.
- Każdy test CRUD ma sam przygotować swoje preconditions przez fixture/helper. Nie uzależniaj go od kolejności ani sukcesu innego testu.
- Zarejestruj ID stacji natychmiast po skutecznym utworzeniu, zanim wykonasz dalsze asercje. Uwzględnij sprzątanie również wtedy, gdy późniejsza walidacja odpowiedzi nie przejdzie.
- Sprzątanie wykonuj w teardown/`finally`, także po błędzie testu. Usuwaj wyłącznie zasoby utworzone przez bieżący test lub health probe i zapisane w jego rejestrze.
- Nigdy nie usuwaj wszystkich stacji konta ani zasobów znalezionych tylko po prefiksie.
- Test DELETE powinien oznaczyć zasób jako usunięty po potwierdzeniu operacji. Udokumentowana odpowiedź „już nie istnieje” w cleanup może być idempotentna; inne błędy sprzątania muszą być widoczne i nie mogą zastąpić informacji o pierwotnym błędzie.
- Nie ponawiaj automatycznie POST po niejednoznacznym timeout, jeśli API nie gwarantuje idempotencji. Zgłoś możliwość osierocenia zasobu i bezpieczną procedurę ręcznego sprawdzenia.

## Health checks jako bramka

Zastosuj projekty Playwright i `dependencies`:

- `health-stations` → projekt testów CRUD stacji;
- `health-weather` → projekt testów pogody.

Nieudany health check blokuje zależny projekt, a cała komenda kończy się kodem niezerowym. Niezależna usługa nadal może być testowana. Nie stosuj flag pozwalających ominąć tę bramkę w skryptach live/CI.

Health check stacji powinien sprawdzić autoryzowany odczyt listy i kontrakt odpowiedzi, a następnie wykonać minimalny, izolowany probe create/read/update/delete, aby potwierdzić także uprawnienia zapisu. Probe musi korzystać z tych samych klientów i mechanizmu cleanup, bez duplikowania implementacji CRUD. Opisz, że jest mutujący i zużywa limit API.

Health check pogody powinien wykonać rzeczywiste wyszukanie znanego miasta oraz sprawdzić status i minimalny kontrakt.

Walidacja konfiguracji ma działać przed żądaniami. Rozróżnij brak klucza, odmowę dostępu, brak uprawnień/nieaktywny klucz, przekroczenie limitu i niedostępność usługi, zgodnie ze zweryfikowanym kontraktem. Nie zamieniaj takich błędów na sukces lub ciche `skip`.

## Wymagane testy i asercje

Każdy test, także health check i test pomocniczy, musi mieć stały, unikalny identyfikator w tytule. Dla testów parametryzowanych identyfikator musi być unikalny dla każdego przypadku. Nie generuj identyfikatorów testów losowo.

Przykładowe identyfikatory scenariuszy live:

| ID           | Scenariusz i minimalne asercje                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `HC-ST-001`  | Gotowość API stacji: odczyt i mutujący probe ze sprzątaniem                                         |
| `HC-WE-001`  | Gotowość API pogody: poprawna odpowiedź dla znanego miasta                                          |
| `ST-CRT-001` | Utworzenie: dokładny status, schemat, ID i zgodność zapisanych pól z wejściem                       |
| `ST-UPD-001` | Aktualizacja: status oraz ponowny GET potwierdzający zmiany i zachowanie pól, których nie zmieniano |
| `ST-GET-001` | Odczyt po ID: status, schemat i tożsamość wcześniej utworzonej stacji                               |
| `ST-LST-001` | Lista: obecność własnej stacji, bez założenia pustego konta                                         |
| `ST-DEL-001` | Usunięcie: dokładny status i potwierdzenie braku zasobu zgodnie z kontraktem                        |
| `WE-GET-001` | Pogoda: status, schemat, identyfikacja lokalizacji, żądane jednostki i poprawność typów             |

Nie sprawdzaj tylko `response.ok()` ani samego statusu. Nie akceptuj kilku statusów „na wszelki wypadek”. Nie sprawdzaj stałej temperatury, opisu pogody ani liczby stacji na współdzielonym koncie.

Jeżeli usługa wykazuje udokumentowaną eventual consistency, użyj ograniczonego `expect.poll` z timeoutem i kontrolą liczby żądań. Nie stosuj arbitralnych `sleep`.

Dodaj niewielki zestaw testów negatywnych tylko dla udokumentowanych przypadków, np. nieistniejącego zasobu i nieprawidłowych argumentów. Nie zakładaj, że każdy błędny input musi skutkować 400. Testy nie mogą stanowić obciążeniowego sprawdzania limitów.

Dodaj testy offline fabryk, walidacji konfiguracji, redakcji sekretów, obsługi pustego body oraz cleanup. Mocks w tych testach są dozwolone, ale muszą być oddzielone od projektów live i nie mogą być przedstawiane jako weryfikacja OpenWeatherMap.

## Bezpieczeństwo publicznego repozytorium

- Klucze odczytuj wyłącznie ze zmiennych środowiskowych, lokalnie opcjonalnie przez `.env`, w CI przez GitHub Actions Secrets.
- Zaproponuj np. `OPENWEATHER_STATIONS_API_KEY` i `OPENWEATHER_WEATHER_API_KEY`; mogą mieć tę samą wartość, ale konfiguracja nie może zakładać jednakowych uprawnień.
- `.env.example` zawiera wyłącznie puste wartości lub oczywiste placeholdery. Ignoruj `.env` i inne lokalne pliki sekretów, zachowując śledzenie `.env.example`.
- Nigdy nie odczytuj lokalnych sekretów w celu wyświetlenia ich użytkownikowi lub zapisania w dokumentacji.
- Klucz przekazywany jako `appid` może wyciec przez URL. Sprawdź logi, błędy Playwright, reporter, załączniki i diagnostykę: usuń wartości sekretów również z query string i nagłówków.
- Nie zapisuj surowych requestów, trace ani body zawierających prywatne dane do publicznych raportów. Jeśli wbudowane raportowanie nie gwarantuje redakcji, wyłącz niebezpieczne artefakty i zastosuj bezpieczny reporter/diagnostykę.
- Nie przesyłaj artefaktów zawierających sekrety do GitHub Actions, GitHub Pages ani innych usług. Maskowanie konsoli Actions nie wystarcza do ochrony plików.
- Używaj dedykowanego konta/klucza szkoleniowego i wyłącznie syntetycznych danych stacji, bez prywatnych współrzędnych.
- Endpointy powinny być stałe lub ograniczone do zaufanych hostów HTTPS OpenWeatherMap, aby konfiguracja nie wysłała klucza na przypadkowy serwer.
- Dokumentacja ma opisywać pozyskanie klucza, uprawnienia, konfigurację Secrets, rotację i postępowanie po wycieku, nigdy rzeczywiste credentials.

## GitHub Actions

Utwórz `.github/workflows/api-tests.yml`:

- `workflow_dispatch` — ręczne uruchamianie;
- `push` na `main` — uruchamianie po merge do brancha głównego; opisz, że obejmuje również bezpośrednie push.
- Jeśli repozytorium ma inną nazwę głównego brancha, użyj jej konsekwentnie.
- Minimalne uprawnienia: `contents: read`.
- Instalacja przez `npm ci`, zgodna wersja Node.js, lint, typecheck, testy offline i testy live z health dependencies.
- API-only testy nie wymagają instalowania przeglądarek ani systemowych zależności browserów.
- Sekrety wstrzykuj tylko do kroku/jobu, który rzeczywiście potrzebuje API.
- Brak sekretów musi dawać czytelny błąd konfiguracji, nie zielony workflow.
- Ogranicz równoległość live, np. `workers: 1`, oraz liczbę requestów. Domyślnie ustaw `retries: 0`, by nie multiplikować operacji mutujących.
- Zastosuj `concurrency` dla live runs i `cancel-in-progress: false`, aby nie przerywać cleanup aktywnego przebiegu. Ustal rozsądny timeout joba.
- Załaduj wyłącznie zweryfikowane, zredagowane raporty także po niepowodzeniu; użyj `if: always()` i krótkiej retencji.
- Nie używaj `pull_request_target` do wykonania niezweryfikowanego kodu z dostępem do sekretów.

Jeśli dodasz weryfikację PR, uruchamiaj tylko lint/typecheck/testy offline bez sekretów, szczególnie dla forków.

## Instrukcje dla Copilota

Utwórz `.github/copilot-instructions.md` zawierający:

- opis i zakres projektu;
- strukturę i odpowiedzialności folderów;
- komendy instalacji i weryfikacji;
- standard TypeScript, dokumentowania klas/metod, asercji i unikalnych ID;
- zasady fixtures, izolacji, health gate i cleanup;
- sekcję `Credentials Access`: nazwy env/Secrets, sposób uzyskania dostępu przez właściciela, zakaz wyświetlania/commitowania kluczy i redakcję diagnostyki;
- zakaz operacji na cudzych stacjach i zakaz zgadywania kontraktu;
- regułę aktualizacji testów i dokumentacji po zmianie kontraktu.

## Skill do review testu automatycznego

Utwórz `.github/skills/review-api-test/SKILL.md` zgodnie z aktualnym formatem Agent Skills obsługiwanym przez GitHub Copilot. Dodaj YAML frontmatter z `name: review-api-test` oraz opisem sytuacji, w których skill powinien się uruchamiać.

Skill ma instruować agenta, jak przeprowadzić review wskazanego testu API i powiązanych fixtures/klientów:

1. Sprawdzić zgodność scenariusza z dokumentacją API.
2. Zweryfikować unikalne ID, czytelność i dokumentację.
3. Ocenić status, schemat i asercje biznesowe, nie tylko sam HTTP status.
4. Sprawdzić izolację, cleanup po błędach i brak usuwania cudzych zasobów.
5. Zweryfikować podział modeli, fabryk, danych i klientów.
6. Sprawdzić health dependencies, timeouty, retry, flakiness i limity.
7. Ocenić ryzyko wycieku kluczy oraz prywatnych danych w logach/artefaktach.
8. Uruchomić dostępne sprawdzenia offline; live tylko z uprawnionym dostępem i bez ujawniania sekretów.

Wynik review: tabela usterek z wagą, lokalizacją, dowodem i proponowaną poprawką; osobno braki w weryfikacji. Werdykt: `PASS`, `PASS WITH COMMENTS` albo `CHANGES REQUIRED`. Nie zgłaszaj hipotetycznych problemów jako potwierdzonych. Skill ma przeprowadzać review, a nie automatycznie modyfikować kod.

W README opisz sposób użycia skillu i podaj przykładowe polecenie review wybranego testu.

## README i komendy

README powinien zawierać:

- cel szkoleniowy, zakres, strukturę projektu i przepływ request → klient → test;
- wymagania Node.js, dostęp do usług, ewentualne koszty i limity;
- instrukcję konfiguracji lokalnej oraz GitHub Secrets;
- instrukcje uruchomienia health checks, testów jednej usługi, całego live suite i testów offline;
- opis unikalnych ID, generowania danych i sprzątania;
- instrukcję dodania nowego testu;
- troubleshooting: brak klucza, autoryzacja/uprawnienia, limity, awaria usługi, cleanup;
- ostrzeżenie, że live suite tworzy i usuwa prawdziwe stacje na koncie szkoleniowym;
- ograniczenia weryfikacji, jeśli testów live nie dało się uruchomić.

Dodaj skrypty npm, np. `lint`, `typecheck`, `format:check`, `test:unit`, `test:health`, `test:stations`, `test:weather`, `test:live`. Komendy offline nie mogą wymagać sekretów ani połączenia z OpenWeatherMap.

## Sposób realizacji i kryteria odbioru

Najpierw przedstaw krótki plan oraz zweryfikowany kontrakt, następnie wykonaj implementację. Zadawaj pytania wyłącznie przy rzeczywistych blokadach lub istotnych niejasnościach.

Projekt jest gotowy, gdy:

- wszystkie wymagane foldery, klienci, modele, fabryki, fixtures, testy, dokumentacja, workflow, instrukcje Copilota i skill istnieją oraz mają rzeczywistą treść;
- `npm ci`, lint, typecheck, format check i testy offline przechodzą;
- każdy test ma unikalny, stabilny ID;
- projekty live są poprawnie połączone z health gate;
- scenariusze CRUD są niezależne i sprzątają własne zasoby także po błędzie;
- test pogody weryfikuje kontrakt i lokalizację bez asercji na zmienną wartość temperatury;
- brak klucza kończy live suite błędem, natomiast offline checks nadal działają;
- kod, śledzone pliki, diagnostyka i publikowane artefakty nie zawierają sekretów;
- z uprawnionymi kluczami przeprowadzono rzeczywisty live run, o ile dostęp został zapewniony.

Nie twierdź, że live testy przeszły, jeśli nie było dostępu do API. W takim przypadku dostarcz kompletny projekt, wyniki offline i oznacz weryfikację live jako **zablokowaną**, z dokładnym warunkiem jej wykonania. Nigdy nie fabrykuj wyników.

Na końcu podsumuj utworzone elementy, wykonane komendy i ich wyniki, wyniki live/health checks, status cleanup oraz pozostałe ograniczenia. Nie wykonuj commit, push ani publikacji repozytorium bez osobnego polecenia.
