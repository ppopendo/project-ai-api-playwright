import type { WeatherUnits } from '../models/weather.models.js';

/**
 * Jawne, niesekretne dane miast do testów pogodowych.
 *
 * Wartości są stałe i deterministyczne — testy nie losują miast ani oczekiwanych
 * rezultatów. Nie zawierają prywatnych współrzędnych.
 */

/** Opis znanego miasta do zapytań pogodowych. */
export interface CityFixture {
  /** Nazwa miasta. */
  readonly city: string;
  /** Kod kraju ISO 3166. */
  readonly countryCode: string;
  /** Oczekiwana nazwa lokalizacji zwracana przez API (do asercji identyfikacji). */
  readonly expectedName: string;
  /** Oczekiwany kod kraju w odpowiedzi. */
  readonly expectedCountry: string;
}

/** Londyn — używany m.in. przez health check pogody. */
export const LONDON: CityFixture = {
  city: 'London',
  countryCode: 'GB',
  expectedName: 'London',
  expectedCountry: 'GB',
};

/** Paryż. */
export const PARIS: CityFixture = {
  city: 'Paris',
  countryCode: 'FR',
  expectedName: 'Paris',
  expectedCountry: 'FR',
};

/** Warszawa. */
export const WARSAW: CityFixture = {
  city: 'Warsaw',
  countryCode: 'PL',
  expectedName: 'Warsaw',
  expectedCountry: 'PL',
};

/** Miasto używane przez health check pogody. */
export const HEALTH_CITY: CityFixture = LONDON;

/** Domyślny układ jednostek używany w testach pogodowych. */
export const DEFAULT_UNITS: WeatherUnits = 'metric';

/** Nazwa nieistniejącego miasta do testu negatywnego (status 404). */
export const UNKNOWN_CITY = 'Nosuchcitynamehere12345';
