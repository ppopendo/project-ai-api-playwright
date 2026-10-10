import { config as loadDotenv } from 'dotenv';

/**
 * Walidacja i udostępnianie konfiguracji środowiskowej dla testów API.
 *
 * Na potrzeby szkoleniowe używamy jednego klucza API `OPENWEATHER_API_KEY` dla obu
 * usług (zarządzanie stacjami oraz aktualna pogoda). Klucz jest odczytywany wyłącznie
 * ze zmiennych środowiskowych (lokalnie opcjonalnie przez plik `.env`, w CI przez
 * GitHub Actions Secrets). Moduł nie loguje ani nie zwraca wartości sekretu w błędach.
 */

// Wczytanie zmiennych z pliku `.env`, jeśli istnieje. Nie nadpisuje już ustawionych
// zmiennych środowiskowych (pierwszeństwo ma rzeczywiste środowisko, np. CI).
loadDotenv();

/** Lista zaufanych hostów HTTPS OpenWeatherMap, do których wolno wysłać klucz API. */
export const TRUSTED_HOSTS: readonly string[] = ['api.openweathermap.org'];

/** Domyślny bazowy URL API OpenWeatherMap. */
export const DEFAULT_BASE_URL = 'https://api.openweathermap.org';

/** Nazwa zmiennej środowiskowej z kluczem API. */
export const API_KEY_ENV = 'OPENWEATHER_API_KEY';

/**
 * Błąd konfiguracji — brak wymaganej zmiennej lub niedozwolona wartość.
 *
 * Rzucany przed wykonaniem jakiegokolwiek żądania HTTP, aby brak konfiguracji
 * kończył się czytelnym błędem, a nie fałszywie zielonym testem.
 */
export class ConfigError extends Error {
  public override readonly name = 'ConfigError';
  public constructor(message: string) {
    super(message);
  }
}

/** Identyfikator usługi, dla której pobierana jest konfiguracja. */
export type ServiceName = 'stations' | 'weather';

/** Zweryfikowana konfiguracja pojedynczej usługi. */
export interface ServiceConfig {
  /** Nazwa usługi. */
  readonly service: ServiceName;
  /** Bazowy URL (zaufany host HTTPS). */
  readonly baseUrl: string;
  /** Klucz API przekazywany jako parametr `appid`. */
  readonly apiKey: string;
}

/**
 * Waliduje i zwraca bazowy URL, upewniając się, że używa HTTPS i zaufanego hosta.
 *
 * Zapobiega wysłaniu klucza API na przypadkowy lub niezaufany serwer.
 *
 * @param rawBaseUrl Opcjonalny URL ze zmiennej środowiskowej; domyślnie {@link DEFAULT_BASE_URL}.
 * @returns Znormalizowany bazowy URL bez końcowego ukośnika.
 * @throws {ConfigError} Gdy URL jest nieprawidłowy, nie używa HTTPS lub host nie jest zaufany.
 */
export function resolveBaseUrl(rawBaseUrl?: string): string {
  const value = (rawBaseUrl ?? DEFAULT_BASE_URL).trim();
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ConfigError(`Nieprawidłowy OPENWEATHER_BASE_URL: nie jest poprawnym adresem URL.`);
  }
  if (url.protocol !== 'https:') {
    throw new ConfigError('OPENWEATHER_BASE_URL musi używać protokołu HTTPS.');
  }
  if (!TRUSTED_HOSTS.includes(url.hostname)) {
    throw new ConfigError(
      `Host "${url.hostname}" nie jest zaufanym hostem OpenWeatherMap (${TRUSTED_HOSTS.join(', ')}).`,
    );
  }
  return `${url.protocol}//${url.host}`;
}

/**
 * Odczytuje i waliduje konfigurację dla wskazanej usługi.
 *
 * Obie usługi korzystają z tego samego klucza `OPENWEATHER_API_KEY`.
 *
 * @param service Usługa, dla której pobierana jest konfiguracja.
 * @param env Źródło zmiennych środowiskowych (domyślnie `process.env`); wstrzykiwane w testach.
 * @returns Zweryfikowana konfiguracja usługi.
 * @throws {ConfigError} Gdy brak klucza lub bazowy URL jest nieprawidłowy.
 */
export function getServiceConfig(
  service: ServiceName,
  env: NodeJS.ProcessEnv = process.env,
): ServiceConfig {
  const apiKey = (env[API_KEY_ENV] ?? '').trim();
  if (!apiKey) {
    throw new ConfigError(
      `Brak klucza API. Ustaw ${API_KEY_ENV} w środowisku ` +
        `(lokalnie w pliku .env, w CI jako GitHub Actions Secret).`,
    );
  }
  const baseUrl = resolveBaseUrl(env['OPENWEATHER_BASE_URL']);
  return { service, baseUrl, apiKey };
}

/**
 * Zwraca listę znanych wartości sekretów z konfiguracji środowiska.
 *
 * Używane przez warstwę redakcji, aby usunąć rzeczywisty klucz z diagnostyki.
 *
 * @param env Źródło zmiennych środowiskowych (domyślnie `process.env`).
 * @returns Tablica niepustych wartości kluczy (bez duplikatów).
 */
export function collectKnownSecrets(env: NodeJS.ProcessEnv = process.env): string[] {
  const candidates = [env[API_KEY_ENV]];
  return [...new Set(candidates.map((v) => v?.trim()).filter((v): v is string => Boolean(v)))];
}
