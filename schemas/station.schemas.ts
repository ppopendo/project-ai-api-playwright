import { z } from 'zod';

/**
 * Schematy walidacji odpowiedzi Weather Stations API 3.0.
 *
 * Interfejsy TypeScript nie weryfikują danych w runtime — te schematy sprawdzają
 * rzeczywisty kształt odpowiedzi API i stanowią dowód zgodności kontraktu.
 */

/** Schemat stacji zwracanej przez GET (pojedynczy/listę), PUT. */
export const stationSchema = z
  .object({
    id: z.string().min(1),
    created_at: z.string().min(1),
    updated_at: z.string().min(1),
    external_id: z.string(),
    name: z.string(),
    longitude: z.number(),
    latitude: z.number(),
    altitude: z.number(),
    rank: z.number(),
  })
  .strict();

/** Schemat listy stacji (`GET /data/3.0/stations`). */
export const stationListSchema = z.array(stationSchema);

/**
 * Schemat odpowiedzi tworzenia stacji (`POST`).
 *
 * Odpowiedź POST używa pola `ID` (wielkimi literami) i zawiera dodatkowe pola
 * serwerowe `user_id` oraz `source_type`.
 */
export const createdStationSchema = z
  .object({
    ID: z.string().min(1),
    created_at: z.string().min(1),
    updated_at: z.string().min(1),
    user_id: z.string(),
    external_id: z.string(),
    name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number(),
    rank: z.number(),
    source_type: z.number(),
  })
  .strict();

/** Schemat błędu stacji (np. 404 po usunięciu). */
export const stationErrorSchema = z
  .object({
    code: z.number(),
    message: z.string(),
  })
  .strict();
