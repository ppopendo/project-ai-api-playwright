/**
 * Narzędzia do redakcji sekretów w tekstach diagnostycznych.
 *
 * Klucz API OpenWeatherMap jest przekazywany jako parametr zapytania `appid`,
 * więc może wyciec przez adresy URL, komunikaty błędów, logi i artefakty raportów.
 * Ten moduł centralizuje usuwanie wartości sekretów oraz maskowanie parametru `appid`.
 */

/** Tekst wstawiany w miejsce zredagowanej wartości. */
export const REDACTION_PLACEHOLDER = '***REDACTED***';

/**
 * Maskuje wartość parametru `appid` w dowolnym tekście zawierającym query string.
 *
 * Działa niezależnie od znajomości konkretnej wartości klucza — wyszukuje wzorzec
 * `appid=...` w URL-ach i podmienia wartość na placeholder.
 *
 * @param text Tekst (URL, komunikat błędu, log) do zredagowania.
 * @returns Tekst z zamaskowanym parametrem `appid`.
 */
export function redactAppId(text: string): string {
  return text.replace(/([?&]appid=)[^&\s"']+/gi, `$1${REDACTION_PLACEHOLDER}`);
}

/**
 * Usuwa z tekstu wszystkie wystąpienia podanych wartości sekretów.
 *
 * Używane do redakcji znanych kluczy API (np. przed zapisaniem komunikatu błędu),
 * aby żadna rzeczywista wartość nie trafiła do logów ani raportów.
 *
 * @param text Tekst do zredagowania.
 * @param secrets Lista wartości sekretów do usunięcia; puste/krótkie wartości są pomijane.
 * @returns Tekst z podmienionymi sekretami.
 */
export function redactSecrets(text: string, secrets: readonly (string | undefined)[]): string {
  let result = text;
  for (const secret of secrets) {
    if (secret && secret.length >= 8) {
      result = result.split(secret).join(REDACTION_PLACEHOLDER);
    }
  }
  return result;
}

/**
 * Pełna redakcja tekstu diagnostycznego: maskuje `appid` oraz znane sekrety.
 *
 * @param text Tekst do zredagowania.
 * @param secrets Lista znanych wartości sekretów do dodatkowego usunięcia.
 * @returns Bezpieczny do zalogowania tekst.
 */
export function redact(text: string, secrets: readonly (string | undefined)[] = []): string {
  return redactSecrets(redactAppId(text), secrets);
}
