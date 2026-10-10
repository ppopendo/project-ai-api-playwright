import { test, expect } from '../../fixtures/api.fixture.js';
import { parseJsonBody } from '../../api/ApiBase.js';
import { stationErrorSchema } from '../../schemas/station.schemas.js';
import { buildCreateStationInput } from '../../factories/station.factory.js';

/** Prawdopodobnie poprawny formalnie, lecz nieistniejący identyfikator stacji. */
const NONEXISTENT_ID = '0000000000000000deadbeef';

/**
 * Testy negatywne stacji dla udokumentowanych przypadków błędnych.
 *
 * Kontrakt potwierdza, że błędne żądania nie tworzą zasobu (status 4xx), więc testy
 * nie wymagają rejestru ani sprzątania.
 */
test.describe('Stacje: przypadki negatywne', () => {
  test('ST-NEG-001: odczyt nieistniejącej stacji zwraca 404 z kodem 404001', async ({
    stationsApi,
  }) => {
    const response = await stationsApi.getStation(NONEXISTENT_ID);
    const error = stationErrorSchema.parse(parseJsonBody(response));

    const actual = { status: response.status, code: error.code };
    const expected = { status: 404, code: 404001 };
    expect(actual).toEqual(expected);
  });

  test('ST-NEG-002: utworzenie z błędną szerokością geograficzną zwraca 400 z kodem 400001', async ({
    stationsApi,
  }) => {
    const response = await stationsApi.createStation(buildCreateStationInput({ latitude: 999 }));
    const error = stationErrorSchema.parse(parseJsonBody(response));

    const actual = { status: response.status, code: error.code };
    const expected = { status: 400, code: 400001 };
    expect(actual).toEqual(expected);
  });
});
