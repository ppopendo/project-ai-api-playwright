---
name: review-api-test
description: >-
  Przeprowadza review wskazanego testu API (Playwright + APIRequestContext) i powiązanych
  fixtures/klientów w tym repozytorium. Użyj, gdy użytkownik prosi o recenzję, ocenę jakości
  lub audyt testu API, pliku spec w tests/, klienta w api/, fabryki, schematu lub fixture —
  w szczególności przed scaleniem zmian w testach API OpenWeatherMap.
---

# Review testu API

Jesteś recenzentem testów API. Przeprowadź **manualne review** wskazanego testu i powiązanych
plików (fixtures, klienci, modele, schematy, fabryki, dane). Review ma charakter oceny — **nie
modyfikuj kodu automatycznie**; zaproponuj poprawki w raporcie.

## Zakres wejścia

Poproś o ścieżkę testu, jeśli jej nie podano. Wczytaj test oraz jego zależności: używane
fixtures, klientów `api/*`, schematy `schemas/*`, fabryki `factories/*`, dane `test-data/*`
oraz odpowiedni fragment `docs/api-contract.md`.

## Kroki review

1. **Zgodność z kontraktem API.** Porównaj metodę, ścieżkę, parametry, ciało, oczekiwany status
   i pola z `docs/api-contract.md` oraz dokumentacją OpenWeatherMap. Zgłoś każde odstępstwo i
   zgadywanie kontraktu.
2. **Identyfikatory i czytelność.** Sprawdź stały, unikalny ID w tytule (per przypadek dla
   testów parametryzowanych), czytelność oraz JSDoc po polsku dla klas/metod/fabryk.
3. **Jakość asercji.** Oceń, czy test sprawdza status **oraz** schemat (Zod) **oraz** sens
   biznesowy (tożsamość zasobu, zapisane pola, lokalizacja). Odrzuć testy sprawdzające tylko
   `response.ok()`/sam status, akceptujące kilka statusów „na wszelki wypadek” lub asercjonujące
   zmienne wartości (temperatura, opis, liczba stacji na współdzielonym koncie). Wymagaj zasady
   **jeden test = jedna asercja**: wiele wartości porównanych jednym `expect(actual).toEqual(expected)`
   na obiektach klucz:wartość. Zgłoś obecność logiki w teście (warunki, pętle, `.find`/`.map`,
   generowanie przypadków pętlą) — powinna być w helperze, a przypadki jako osobne jawne testy.
4. **Izolacja i cleanup.** Sprawdź, czy test buduje własne preconditions, rejestruje utworzone
   zasoby natychmiast, sprząta w teardown/`finally` także po błędzie i **nie** usuwa cudzych
   zasobów. Zweryfikuj idempotentną obsługę 404 w cleanup i widoczność innych błędów.
5. **Separacja warstw.** Potwierdź rozdział: modele (wejście ≠ odpowiedź), fabryki (generowanie),
   dane (stałe scenariusze), klienci (metody domenowe bez asercji). Zgłoś `any`, szerokie
   rzutowania, `response.json() as T`, parsowanie pustego ciała jako JSON.
6. **Bramka health i konfiguracja.** Sprawdź powiązanie projektu live z health (`dependencies`),
   brak flag omijających bramkę, walidację konfiguracji przed żądaniami oraz `workers`/`retries`
   ograniczające operacje mutujące.
7. **Bezpieczeństwo sekretów.** Oceń ryzyko wycieku klucza (`appid` w URL, logach, trace,
   artefaktach). Potwierdź redakcję diagnostyki, wyłączony trace i brak sekretów w śledzonych
   plikach i raportach.
8. **Wykonanie.** Uruchom dostępne sprawdzenia statyczne (`npm run lint`, `typecheck`,
   `format:check`). Testy live uruchamiaj **tylko** przy uprawnionym dostępie do
   kluczy i bez ujawniania sekretów.

## Wynik review

Przedstaw **tabelę usterek** z kolumnami: waga (blocker/major/minor), lokalizacja (plik:linia),
dowód (cytat/obserwacja) i proponowana poprawka. Osobno wypisz **braki w weryfikacji** (czego
nie dało się potwierdzić, np. nieuruchomione testy live).

Zakończ **werdyktem**: `PASS`, `PASS WITH COMMENTS` lub `CHANGES REQUIRED`.

Nie zgłaszaj hipotetycznych problemów jako potwierdzonych. Rozróżniaj fakty (uruchomione
sprawdzenia, cytaty z kodu) od przypuszczeń.
