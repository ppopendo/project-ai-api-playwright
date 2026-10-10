import { test, expect } from '../../fixtures/api.fixture.js';
import { parseJsonBody } from '../../api/ApiBase.js';
import { currentWeatherSchema, weatherErrorSchema } from '../../schemas/weather.schemas.js';
import { buildWeatherQuery } from '../../factories/weather-query.factory.js';
import { LONDON, PARIS, WARSAW, UNKNOWN_CITY, DEFAULT_UNITS } from '../../test-data/cities.js';
import type { CityFixture } from '../../test-data/cities.js';
import type { WeatherApi } from '../../api/WeatherApi.js';

/**
 * Wykonuje zapytanie o pogodę i zwraca zebrane wartości identyfikacji lokalizacji.
 *
 * Poprawność typów pól gwarantuje schemat (`currentWeatherSchema`), więc helper
 * zbiera jedynie stabilne wartości biznesowe do pojedynczej asercji w teście.
 *
 * @param weatherApi Klient pogody.
 * @param city Opis miasta do zapytania.
 * @returns Obiekt `{ status, name, country }` z rzeczywistej odpowiedzi.
 */
async function fetchLocation(
  weatherApi: WeatherApi,
  city: CityFixture,
): Promise<{ status: number; name: string; country: string | undefined }> {
  const response = await weatherApi.getCurrentWeatherByCity(buildWeatherQuery(city));
  const weather = currentWeatherSchema.parse(parseJsonBody(response));
  return { status: response.status, name: weather.name, country: weather.sys.country };
}

/**
 * Testy odczytu aktualnej pogody.
 *
 * Każdy test ma pojedynczą asercję porównującą identyfikację lokalizacji
 * (status, nazwa, kraj) z wartościami oczekiwanymi. Nie asercjonujemy zmiennych
 * wartości (temperatura, opis) — typy pól pokrywa schemat.
 */
test.describe('Pogoda: odczyt aktualnej pogody', () => {
  test('WE-GET-001: pogoda dla London,GB — status i identyfikacja lokalizacji', async ({
    weatherApi,
  }) => {
    const actual = await fetchLocation(weatherApi, LONDON);
    const expected = { status: 200, name: LONDON.expectedName, country: LONDON.expectedCountry };
    expect(actual).toEqual(expected);
  });

  test('WE-GET-002: pogoda dla Paris,FR — status i identyfikacja lokalizacji', async ({
    weatherApi,
  }) => {
    const actual = await fetchLocation(weatherApi, PARIS);
    const expected = { status: 200, name: PARIS.expectedName, country: PARIS.expectedCountry };
    expect(actual).toEqual(expected);
  });

  test('WE-GET-003: pogoda dla Warsaw,PL — status i identyfikacja lokalizacji', async ({
    weatherApi,
  }) => {
    const actual = await fetchLocation(weatherApi, WARSAW);
    const expected = { status: 200, name: WARSAW.expectedName, country: WARSAW.expectedCountry };
    expect(actual).toEqual(expected);
  });

  test('WE-NEG-001: pogoda dla nieznanego miasta zwraca 404 z komunikatem "city not found"', async ({
    weatherApi,
  }) => {
    const response = await weatherApi.getCurrentWeatherByCity({
      city: UNKNOWN_CITY,
      units: DEFAULT_UNITS,
    });
    const error = weatherErrorSchema.parse(parseJsonBody(response));

    const actual = { status: response.status, cod: String(error.cod), message: error.message };
    const expected = { status: 404, cod: '404', message: 'city not found' };
    expect(actual).toEqual(expected);
  });
});
