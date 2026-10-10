import { test, expect } from '../../fixtures/api.fixture.js';
import { parseJsonBody } from '../../api/ApiBase.js';
import { stationSchema } from '../../schemas/station.schemas.js';
import { createRegisteredStation } from '../../helpers/preconditions.js';

/**
 * Test odczytu stacji po identyfikatorze.
 */
test.describe('Stacje: odczyt po ID', () => {
  test('ST-GET-001: odczyt po ID zwraca 200, schemat i tożsamość utworzonej stacji', async ({
    stationsApi,
    registry,
  }) => {
    const { input, station } = await createRegisteredStation(stationsApi, registry);

    const response = await stationsApi.getStation(station.ID);
    const fetched = stationSchema.parse(parseJsonBody(response));

    const actual = {
      status: response.status,
      id: fetched.id,
      external_id: fetched.external_id,
      name: fetched.name,
      latitude: fetched.latitude,
      longitude: fetched.longitude,
      altitude: fetched.altitude,
    };
    const expected = {
      status: 200,
      id: station.ID,
      external_id: input.external_id,
      name: input.name,
      latitude: input.latitude,
      longitude: input.longitude,
      altitude: input.altitude,
    };
    expect(actual).toEqual(expected);
  });
});
