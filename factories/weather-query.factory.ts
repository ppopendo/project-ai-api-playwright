import type { WeatherQueryInput } from '../models/weather.models.js';
import { DEFAULT_UNITS, type CityFixture } from '../test-data/cities.js';

/**
 * Fabryka zapytań pogodowych.
 *
 * Tworzy poprawne, deterministyczne dane wejściowe zapytania na podstawie stałego
 * opisu miasta. Nie losuje miasta ani jednostek — pozwala jedynie na typowane
 * nadpisania.
 */

/**
 * Buduje dane wejściowe zapytania o pogodę dla wskazanego miasta.
 *
 * @param city Stały opis miasta z `test-data`.
 * @param overrides Opcjonalne nadpisania (np. zmiana jednostek lub języka).
 * @returns Kompletne dane wejściowe zapytania o aktualną pogodę.
 */
export function buildWeatherQuery(
  city: CityFixture,
  overrides: Partial<WeatherQueryInput> = {},
): WeatherQueryInput {
  return {
    city: city.city,
    countryCode: city.countryCode,
    units: DEFAULT_UNITS,
    ...overrides,
  };
}
