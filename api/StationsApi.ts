import type { ApiResponse } from '../models/api.models.js';
import type { CreateStationInput, UpdateStationInput } from '../models/station.models.js';
import type { ApiBase } from './ApiBase.js';

/** Ścieżka bazowa Weather Stations API 3.0. */
const STATIONS_PATH = '/data/3.0/stations';

/**
 * Klient domenowy Weather Stations API 3.0.
 *
 * Udostępnia metody CRUD odwzorowujące zweryfikowany kontrakt API. Metody zwracają
 * znormalizowaną odpowiedź {@link ApiResponse} — walidacja statusu i schematu należy
 * do testów. Klient nie zawiera asercji ani danych scenariuszy.
 */
export class StationsApi {
  /**
   * @param api Bazowy klient HTTP z wstrzykniętym kontekstem i kluczem stacji.
   */
  public constructor(private readonly api: ApiBase) {}

  /**
   * Pobiera listę stacji należących do uwierzytelnionego konta.
   *
   * @returns Odpowiedź z tablicą stacji (oczekiwany status 200).
   */
  public listStations(): Promise<ApiResponse> {
    return this.api.get(STATIONS_PATH);
  }

  /**
   * Tworzy nową stację pogodową.
   *
   * @param input Kompletne dane stacji do utworzenia.
   * @returns Odpowiedź z utworzoną stacją (oczekiwany status 201, pole `ID`).
   */
  public createStation(input: CreateStationInput): Promise<ApiResponse> {
    return this.api.post(STATIONS_PATH, { body: input });
  }

  /**
   * Pobiera pojedynczą stację po identyfikatorze nadanym przez serwer.
   *
   * @param id Identyfikator stacji (pole `id`).
   * @returns Odpowiedź ze stacją (oczekiwany status 200) lub błąd 404.
   */
  public getStation(id: string): Promise<ApiResponse> {
    return this.api.get(`${STATIONS_PATH}/${encodeURIComponent(id)}`);
  }

  /**
   * Aktualizuje istniejącą stację (pełne zastąpienie zasobu).
   *
   * @param id Identyfikator stacji do zaktualizowania.
   * @param input Kompletne, nowe dane stacji.
   * @returns Odpowiedź ze zaktualizowaną stacją (oczekiwany status 200).
   */
  public updateStation(id: string, input: UpdateStationInput): Promise<ApiResponse> {
    return this.api.put(`${STATIONS_PATH}/${encodeURIComponent(id)}`, { body: input });
  }

  /**
   * Usuwa stację po identyfikatorze.
   *
   * Zasady bezpieczeństwa: usuwaj wyłącznie zasoby utworzone przez bieżący test lub
   * health probe i zarejestrowane w rejestrze zasobów. Nigdy nie usuwaj cudzych
   * stacji ani całej zawartości konta. Operacja jest nieodwracalna.
   *
   * @param id Identyfikator stacji do usunięcia.
   * @returns Odpowiedź potwierdzająca usunięcie (oczekiwany status 204, puste ciało).
   */
  public deleteStation(id: string): Promise<ApiResponse> {
    return this.api.delete(`${STATIONS_PATH}/${encodeURIComponent(id)}`);
  }
}
