import type { z } from 'zod';
import type { stationSchema } from '../schemas/station.schemas.js';

/** Zwalidowana stacja (wynik {@link stationSchema}). */
type ParsedStation = z.infer<typeof stationSchema>;

/** Podzbiór pól stacji używany do porównań tożsamości w testach. */
export interface StationIdentity {
  /** Identyfikator stacji nadany przez serwer. */
  readonly id: string;
  /** Zewnętrzny identyfikator nadany przez użytkownika. */
  readonly external_id: string;
}

/**
 * Wyszukuje na liście stację o podanym identyfikatorze i zwraca jej tożsamość.
 *
 * Logika wyszukiwania (pętla po liście) jest celowo umieszczona w helperze, aby
 * testy pozostały wolne od pętli i warunków — test jedynie porównuje wynik z
 * wartością oczekiwaną. Zwraca `null`, gdy stacji nie ma na liście.
 *
 * @param stations Lista stacji zwrócona przez API.
 * @param id Szukany identyfikator stacji.
 * @returns Tożsamość znalezionej stacji lub `null`.
 */
export function pickStationIdentity(
  stations: readonly ParsedStation[],
  id: string,
): StationIdentity | null {
  const match = stations.find((station) => station.id === id);
  return match ? { id: match.id, external_id: match.external_id } : null;
}
