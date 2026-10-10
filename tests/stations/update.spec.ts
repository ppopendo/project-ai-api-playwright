import { test, expect } from '../../fixtures/api.fixture.js';
import { parseJsonBody } from '../../api/ApiBase.js';
import { stationSchema } from '../../schemas/station.schemas.js';
import { createRegisteredStation } from '../../helpers/preconditions.js';
import { buildUpdateStationInput } from '../../factories/station.factory.js';

/**
 * Test aktualizacji stacji.
 *
 * Łączy aktualizację (PUT) oraz ponowny odczyt (GET) w jedną asercję: zebrane
 * wartości rzeczywiste porównywane są z oczekiwanymi. `external_id` nie jest
 * zmieniany i musi pozostać zachowany mimo pełnego PUT.
 */
test.describe('Stacje: aktualizacja', () => {
  test('ST-UPD-001: aktualizacja zwraca 200, a ponowny GET potwierdza zmiany i zachowanie external_id', async ({
    stationsApi,
    registry,
  }) => {
    const { input, station } = await createRegisteredStation(stationsApi, registry);

    const updateInput = buildUpdateStationInput(input.external_id);
    const updateResponse = await stationsApi.updateStation(station.ID, updateInput);
    const updated = stationSchema.parse(parseJsonBody(updateResponse));

    const getResponse = await stationsApi.getStation(station.ID);
    const fetched = stationSchema.parse(parseJsonBody(getResponse));

    const actual = {
      updateStatus: updateResponse.status,
      updatedName: updated.name,
      getStatus: getResponse.status,
      name: fetched.name,
      latitude: fetched.latitude,
      longitude: fetched.longitude,
      altitude: fetched.altitude,
      external_id: fetched.external_id,
    };
    const expected = {
      updateStatus: 200,
      updatedName: updateInput.name,
      getStatus: 200,
      name: updateInput.name,
      latitude: updateInput.latitude,
      longitude: updateInput.longitude,
      altitude: updateInput.altitude,
      external_id: input.external_id,
    };
    expect(actual).toEqual(expected);
  });
});
