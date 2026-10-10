import { test, expect } from '../../fixtures/api.fixture.js';
import { parseJsonBody } from '../../api/ApiBase.js';
import { createdStationSchema } from '../../schemas/station.schemas.js';
import { buildCreateStationInput } from '../../factories/station.factory.js';

/**
 * Test utworzenia stacji pogodowej.
 *
 * Obecność i typ pola `ID` gwarantuje schemat (`ID: z.string().min(1)`), więc
 * pojedyncza asercja porównuje status oraz zapisane pola z danymi wejściowymi.
 */
test.describe('Stacje: utworzenie', () => {
  test('ST-CRT-001: utworzenie zwraca 201, schemat, ID oraz zgodność zapisanych pól', async ({
    stationsApi,
    registry,
  }) => {
    const input = buildCreateStationInput();

    const response = await stationsApi.createStation(input);
    const created = createdStationSchema.parse(parseJsonBody(response));
    // Rejestracja natychmiast po utworzeniu, przed asercją.
    registry.registerStation(created.ID);

    const actual = {
      status: response.status,
      external_id: created.external_id,
      name: created.name,
      latitude: created.latitude,
      longitude: created.longitude,
      altitude: created.altitude,
    };
    const expected = {
      status: 201,
      external_id: input.external_id,
      name: input.name,
      latitude: input.latitude,
      longitude: input.longitude,
      altitude: input.altitude,
    };
    expect(actual).toEqual(expected);
  });
});
