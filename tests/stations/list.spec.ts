import { test, expect } from '../../fixtures/api.fixture.js';
import { parseJsonBody } from '../../api/ApiBase.js';
import { stationListSchema } from '../../schemas/station.schemas.js';
import { createRegisteredStation } from '../../helpers/preconditions.js';
import { pickStationIdentity } from '../../helpers/station-lookup.js';

/**
 * Test pobrania listy stacji.
 *
 * Wyszukanie własnej stacji na liście realizuje helper {@link pickStationIdentity}
 * (logika poza testem), dzięki czemu test jedynie porównuje obiekty. Nie zakładamy
 * pustego konta — sprawdzamy wyłącznie obecność własnej stacji.
 */
test.describe('Stacje: lista', () => {
  test('ST-LST-001: lista zawiera własną stację bez założenia pustego konta', async ({
    stationsApi,
    registry,
  }) => {
    const { station } = await createRegisteredStation(stationsApi, registry);

    const response = await stationsApi.listStations();
    const stations = stationListSchema.parse(parseJsonBody(response));

    const actual = {
      status: response.status,
      ownStation: pickStationIdentity(stations, station.ID),
    };
    const expected = {
      status: 200,
      ownStation: { id: station.ID, external_id: station.external_id },
    };
    expect(actual).toEqual(expected);
  });
});
