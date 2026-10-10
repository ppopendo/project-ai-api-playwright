import { test, expect } from '../../fixtures/api.fixture.js';
import { parseJsonBody, hasEmptyBody } from '../../api/ApiBase.js';
import { stationErrorSchema } from '../../schemas/station.schemas.js';
import { createRegisteredStation } from '../../helpers/preconditions.js';

/**
 * Test usunięcia stacji.
 *
 * Łączy usunięcie (DELETE) oraz odczyt po usunięciu (GET → 404) w jedną asercję.
 * Zasób pozostaje w rejestrze — cleanup potraktuje ponowny DELETE (404) jako
 * idempotentny, więc test nie potrzebuje warunkowego wyrejestrowania.
 */
test.describe('Stacje: usunięcie', () => {
  test('ST-DEL-001: usunięcie zwraca 204 i potwierdza brak zasobu (404) zgodnie z kontraktem', async ({
    stationsApi,
    registry,
  }) => {
    const { station } = await createRegisteredStation(stationsApi, registry);

    const deleteResponse = await stationsApi.deleteStation(station.ID);
    const afterDelete = await stationsApi.getStation(station.ID);
    const error = stationErrorSchema.parse(parseJsonBody(afterDelete));

    const actual = {
      deleteStatus: deleteResponse.status,
      deleteBodyEmpty: hasEmptyBody(deleteResponse),
      afterDeleteStatus: afterDelete.status,
      afterDeleteCode: error.code,
    };
    const expected = {
      deleteStatus: 204,
      deleteBodyEmpty: true,
      afterDeleteStatus: 404,
      afterDeleteCode: 404001,
    };
    expect(actual).toEqual(expected);
  });
});
