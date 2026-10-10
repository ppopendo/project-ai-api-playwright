/**
 * Stałe, bazowe dane stacji używane jako punkt wyjścia dla fabryki.
 *
 * Są to wyłącznie syntetyczne, niesekretne wartości. Generowane, unikalne pola
 * (np. `external_id`) dodaje fabryka — tutaj trzymamy tylko stały scenariusz.
 */

/** Prefiks projektu dla identyfikatorów stacji (rozpoznawalny w koncie). */
export const STATION_PREFIX = 'PWTEST';

/**
 * Maksymalna długość pola `external_id` przyjmowana defensywnie przez fabrykę.
 *
 * Ogranicza długość generowanego identyfikatora, aby zmieścić się w limitach API.
 */
export const MAX_EXTERNAL_ID_LENGTH = 64;

/** Bazowe, stałe dane stacji (bez pól generowanych). */
export const BASE_STATION = {
  name: 'PW Training Station',
  latitude: 52.2297,
  longitude: 21.0122,
  altitude: 100,
} as const;

/** Stałe wartości używane w teście aktualizacji stacji (`PUT`). */
export const STATION_UPDATE_VALUES = {
  name: 'PW Training Station (updated)',
  latitude: 50.0647,
  longitude: 19.945,
  altitude: 219,
} as const;
