import { test, expect } from '../../fixtures/api.fixture.js';
import { parseJsonBody } from '../../api/ApiBase.js';
import { currentWeatherSchema } from '../../schemas/weather.schemas.js';
import { buildWeatherQuery } from '../../factories/weather-query.factory.js';
import { HEALTH_CITY } from '../../test-data/cities.js';

/**
 * Health check gotowości Current Weather Data API 2.5.
 *
 * Projekt `health-weather` jest bramką dla projektu `weather`. Wykonuje rzeczywiste
 * wyszukanie znanego miasta oraz sprawdza status i minimalny kontrakt odpowiedzi.
 */
test.describe('Health: Current Weather API', () => {
  test('HC-WE-001: gotowość API pogody — poprawna odpowiedź dla znanego miasta', async ({
    weatherApi,
  }) => {
    const response = await weatherApi.getCurrentWeatherByCity(buildWeatherQuery(HEALTH_CITY));
    const weather = currentWeatherSchema.parse(parseJsonBody(response));

    const actual = {
      status: response.status,
      name: weather.name,
      country: weather.sys.country,
    };
    const expected = {
      status: 200,
      name: HEALTH_CITY.expectedName,
      country: HEALTH_CITY.expectedCountry,
    };
    expect(actual).toEqual(expected);
  });
});
