import { test, expect } from '../../fixtures/api.fixture.js';
import { parseJsonBody, hasEmptyBody } from '../../api/ApiBase.js';
import {
  createdStationSchema,
  stationListSchema,
  stationSchema,
  stationErrorSchema,
} from '../../schemas/station.schemas.js';
import {
  buildCreateStationInput,
  buildUpdateStationInput,
} from '../../factories/station.factory.js';

/**
 * Health check gotowości Weather Stations API 3.0.
 *
 * Projekt `health-stations` jest bramką dla projektu `stations`. Sprawdza
 * autoryzowany odczyt listy wraz z kontraktem, a następnie wykonuje minimalny,
 * izolowany, MUTUJĄCY probe create → read → update → delete, aby potwierdzić także
 * uprawnienia zapisu.
 *
 * UWAGA: probe tworzy i usuwa prawdziwą stację na koncie szkoleniowym oraz zużywa
 * limit API. Używa tych samych klientów i rejestru sprzątania co testy właściwe.
 * Walidacja struktury odpowiedzi odbywa się przez schematy (rzucają przy niezgodności);
 * pojedyncza asercja na końcu porównuje zebrane wartości rzeczywiste z oczekiwanymi.
 */
test.describe('Health: Weather Stations API', () => {
  test('HC-ST-001: gotowość API stacji — odczyt i mutujący probe ze sprzątaniem', async ({
    stationsApi,
    registry,
  }) => {
    // Autoryzowany odczyt listy + walidacja kontraktu.
    const listResponse = await stationsApi.listStations();
    stationListSchema.parse(parseJsonBody(listResponse));

    // Mutujący probe: utworzenie i natychmiastowa rejestracja do sprzątania.
    const input = buildCreateStationInput();
    const createResponse = await stationsApi.createStation(input);
    const created = createdStationSchema.parse(parseJsonBody(createResponse));
    registry.registerStation(created.ID);

    // Odczyt utworzonej stacji.
    const getResponse = await stationsApi.getStation(created.ID);
    const fetched = stationSchema.parse(parseJsonBody(getResponse));

    // Aktualizacja utworzonej stacji.
    const updateInput = buildUpdateStationInput(input.external_id);
    const updateResponse = await stationsApi.updateStation(created.ID, updateInput);
    const updated = stationSchema.parse(parseJsonBody(updateResponse));

    // Usunięcie stacji (potwierdzenie uprawnień zapisu) i odczyt po usunięciu.
    // Rejestr pozostaje — cleanup potraktuje ponowny DELETE (404) jako idempotentny.
    const deleteResponse = await stationsApi.deleteStation(created.ID);
    const afterDelete = await stationsApi.getStation(created.ID);
    const afterError = stationErrorSchema.parse(parseJsonBody(afterDelete));

    const actual = {
      listStatus: listResponse.status,
      createStatus: createResponse.status,
      createdExternalId: created.external_id,
      getStatus: getResponse.status,
      fetchedId: fetched.id,
      updateStatus: updateResponse.status,
      updatedName: updated.name,
      deleteStatus: deleteResponse.status,
      deleteBodyEmpty: hasEmptyBody(deleteResponse),
      afterDeleteStatus: afterDelete.status,
      afterDeleteCode: afterError.code,
    };
    const expected = {
      listStatus: 200,
      createStatus: 201,
      createdExternalId: input.external_id,
      getStatus: 200,
      fetchedId: created.ID,
      updateStatus: 200,
      updatedName: updateInput.name,
      deleteStatus: 204,
      deleteBodyEmpty: true,
      afterDeleteStatus: 404,
      afterDeleteCode: 404001,
    };
    expect(actual).toEqual(expected);
  });
});
