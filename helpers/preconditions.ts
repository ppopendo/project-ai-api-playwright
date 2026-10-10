import { expect } from '@playwright/test';
import type { StationsApi } from '../api/StationsApi.js';
import { parseJsonBody } from '../api/ApiBase.js';
import { createdStationSchema } from '../schemas/station.schemas.js';
import { buildCreateStationInput } from '../factories/station.factory.js';
import type { CreateStationInput, CreatedStation } from '../models/station.models.js';
import type { ResourceRegistry } from './resource-registry.js';

/** Para: dane wejściowe i utworzony zasób zwracana przez precondition. */
export interface CreatedStationContext {
  /** Dane wejściowe użyte do utworzenia stacji. */
  readonly input: CreateStationInput;
  /** Utworzona stacja (z polem `ID`). */
  readonly station: CreatedStation;
}

/**
 * Precondition: tworzy stację i natychmiast rejestruje ją do sprzątania.
 *
 * Każdy test CRUD, który potrzebuje istniejącej stacji, buduje swój stan przez tę
 * funkcję — nie zależąc od innych testów. Rejestracja następuje przed walidacją,
 * aby zasób został posprzątany nawet przy późniejszym błędzie.
 *
 * @param stationsApi Klient stacji.
 * @param registry Rejestr zasobów danego testu.
 * @param overrides Opcjonalne nadpisania danych wejściowych.
 * @returns Kontekst z danymi wejściowymi i utworzoną stacją.
 */
export async function createRegisteredStation(
  stationsApi: StationsApi,
  registry: ResourceRegistry,
  overrides: Partial<CreateStationInput> = {},
): Promise<CreatedStationContext> {
  const input = buildCreateStationInput(overrides);
  const response = await stationsApi.createStation(input);
  expect(response.status, 'precondition: utworzenie stacji powinno zwrócić 201').toBe(201);
  const station = createdStationSchema.parse(parseJsonBody(response));
  registry.registerStation(station.ID);
  return { input, station };
}
