/**
 * Modele domenowe Weather Stations API 3.0.
 *
 * Typy wejściowe (argumenty operacji) są celowo rozdzielone od typów odpowiedzi,
 * ponieważ API zwraca dodatkowe, serwerowe pola i używa innej konwencji nazw
 * (np. pole identyfikatora `ID` w odpowiedzi tworzenia vs `id` w pozostałych).
 */

/**
 * Dane wejściowe do utworzenia stacji pogodowej (`POST /data/3.0/stations`).
 */
export interface CreateStationInput {
  /** Zewnętrzny identyfikator stacji nadawany przez użytkownika (unikalny w koncie). */
  readonly external_id: string;
  /** Czytelna nazwa stacji. */
  readonly name: string;
  /** Szerokość geograficzna w stopniach (-90..90). */
  readonly latitude: number;
  /** Długość geograficzna w stopniach (-180..180). */
  readonly longitude: number;
  /** Wysokość n.p.m. w metrach. */
  readonly altitude: number;
}

/**
 * Dane wejściowe do aktualizacji stacji (`PUT /data/3.0/stations/{id}`).
 *
 * API stosuje semantykę pełnego zastąpienia zasobu, dlatego aktualizacja wymaga
 * kompletu pól tak samo jak tworzenie.
 */
export type UpdateStationInput = CreateStationInput;

/**
 * Dane wejściowe do odczytu/usunięcia konkretnej stacji po identyfikatorze.
 */
export interface StationLookupInput {
  /** Identyfikator stacji nadany przez serwer (pole `id`). */
  readonly id: string;
}

/**
 * Reprezentacja stacji zwracana przez operacje odczytu, listy, aktualizacji.
 *
 * Uwaga: operacja tworzenia zwraca osobny kształt {@link CreatedStation}
 * z polem identyfikatora zapisanym jako `ID` (wielkimi literami).
 */
export interface Station {
  /** Identyfikator stacji nadany przez serwer. */
  readonly id: string;
  /** Znacznik czasu utworzenia (ISO 8601). */
  readonly created_at: string;
  /** Znacznik czasu ostatniej modyfikacji (ISO 8601). */
  readonly updated_at: string;
  /** Zewnętrzny identyfikator nadany przez użytkownika. */
  readonly external_id: string;
  /** Nazwa stacji. */
  readonly name: string;
  /** Długość geograficzna. */
  readonly longitude: number;
  /** Szerokość geograficzna. */
  readonly latitude: number;
  /** Wysokość n.p.m. w metrach. */
  readonly altitude: number;
  /** Ranking stacji wyliczany przez serwer. */
  readonly rank: number;
}

/**
 * Odpowiedź operacji tworzenia stacji (`POST`).
 *
 * Różni się od {@link Station} nazwą pola identyfikatora (`ID`) oraz obecnością
 * pól `user_id` i `source_type`.
 */
export interface CreatedStation {
  /** Identyfikator stacji nadany przez serwer (konwencja `ID` w odpowiedzi POST). */
  readonly ID: string;
  /** Znacznik czasu utworzenia (ISO 8601). */
  readonly created_at: string;
  /** Znacznik czasu modyfikacji (ISO 8601). */
  readonly updated_at: string;
  /** Identyfikator właściciela (konta). */
  readonly user_id: string;
  /** Zewnętrzny identyfikator nadany przez użytkownika. */
  readonly external_id: string;
  /** Nazwa stacji. */
  readonly name: string;
  /** Szerokość geograficzna. */
  readonly latitude: number;
  /** Długość geograficzna. */
  readonly longitude: number;
  /** Wysokość n.p.m. w metrach. */
  readonly altitude: number;
  /** Ranking stacji wyliczany przez serwer. */
  readonly rank: number;
  /** Typ źródła danych stacji wyliczany przez serwer. */
  readonly source_type: number;
}
