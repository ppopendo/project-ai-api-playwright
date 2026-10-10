import { randomUUID } from 'node:crypto';
import type { CreateStationInput, UpdateStationInput } from '../models/station.models.js';
import {
  BASE_STATION,
  MAX_EXTERNAL_ID_LENGTH,
  STATION_PREFIX,
  STATION_UPDATE_VALUES,
} from '../test-data/stations.js';

/**
 * Fabryki generujące poprawne dane wejściowe stacji.
 *
 * Rozdzielają stały scenariusz (z `test-data`) od wartości generowanych. Pozwalają
 * na typowane nadpisania wybranych pól, nie losując oczekiwanych rezultatów.
 */

/**
 * Generuje unikalny, rozpoznawalny `external_id` z prefiksem projektu.
 *
 * Łączy prefiks {@link STATION_PREFIX} z identyfikatorem {@link randomUUID},
 * przycinając wynik do {@link MAX_EXTERNAL_ID_LENGTH}, aby zmieścić się w limitach API.
 *
 * @returns Unikalny identyfikator zewnętrzny stacji.
 */
export function generateExternalId(): string {
  return `${STATION_PREFIX}-${randomUUID()}`.slice(0, MAX_EXTERNAL_ID_LENGTH);
}

/**
 * Buduje poprawne dane do utworzenia stacji.
 *
 * Pole `external_id` jest zawsze unikalne (chyba że jawnie nadpisane). Pozostałe
 * pola pochodzą ze stałego scenariusza bazowego i mogą zostać nadpisane.
 *
 * @param overrides Opcjonalne, typowane nadpisania wybranych pól.
 * @returns Kompletne dane wejściowe operacji tworzenia stacji.
 */
export function buildCreateStationInput(
  overrides: Partial<CreateStationInput> = {},
): CreateStationInput {
  return {
    external_id: generateExternalId(),
    name: BASE_STATION.name,
    latitude: BASE_STATION.latitude,
    longitude: BASE_STATION.longitude,
    altitude: BASE_STATION.altitude,
    ...overrides,
  };
}

/**
 * Buduje poprawne dane do aktualizacji stacji (pełne zastąpienie).
 *
 * Wymaga przekazania `external_id` istniejącej stacji (semantyka pełnego PUT),
 * a pozostałe pola ustawia na stałe, zmienione wartości scenariusza aktualizacji.
 *
 * @param externalId Identyfikator zewnętrzny aktualizowanej stacji.
 * @param overrides Opcjonalne, typowane nadpisania wybranych pól.
 * @returns Kompletne dane wejściowe operacji aktualizacji stacji.
 */
export function buildUpdateStationInput(
  externalId: string,
  overrides: Partial<UpdateStationInput> = {},
): UpdateStationInput {
  return {
    external_id: externalId,
    name: STATION_UPDATE_VALUES.name,
    latitude: STATION_UPDATE_VALUES.latitude,
    longitude: STATION_UPDATE_VALUES.longitude,
    altitude: STATION_UPDATE_VALUES.altitude,
    ...overrides,
  };
}
