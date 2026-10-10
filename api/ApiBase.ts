import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ApiResponse, HttpMethod, QueryParams, RequestOptions } from '../models/api.models.js';
import { redact } from '../helpers/redact.js';

/** Domyślny timeout pojedynczego żądania w milisekundach. */
const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Błąd transportowy (sieciowy) warstwy API z już zredagowaną treścią.
 *
 * Rzucany, gdy żądanie nie dojdzie do skutku (np. problem z siecią). Komunikat
 * jest pozbawiony wartości `appid` i znanych sekretów, aby był bezpieczny w logach.
 */
export class ApiTransportError extends Error {
  public override readonly name = 'ApiTransportError';
  public constructor(message: string) {
    super(message);
  }
}

/**
 * Błąd walidacji/parsowania ciała odpowiedzi.
 *
 * Rzucany, gdy oczekiwano JSON-a, a ciało było puste lub niepoprawne.
 */
export class ApiBodyError extends Error {
  public override readonly name = 'ApiBodyError';
  public constructor(message: string) {
    super(message);
  }
}

/**
 * Bazowy klient HTTP dla usług OpenWeatherMap.
 *
 * Opakowuje wstrzyknięty `APIRequestContext` Playwrighta i centralizuje:
 * dodawanie parametru uwierzytelnienia `appid`, obsługę parametrów zapytania,
 * timeouty oraz bezpieczną (zredagowaną) diagnostykę błędów transportowych.
 *
 * Klasa celowo NIE zawiera asercji testowych ani logiki domenowej — zwraca
 * znormalizowaną odpowiedź {@link ApiResponse}, pozostawiając walidację testom.
 */
export class ApiBase {
  /**
   * @param request Kontekst żądań Playwrighta (wstrzykiwany, zwykle per test).
   * @param apiKey Klucz API przekazywany jako parametr `appid`.
   * @param knownSecrets Lista wartości sekretów do redakcji w komunikatach błędów.
   * @param timeoutMs Domyślny timeout żądań; domyślnie {@link DEFAULT_TIMEOUT_MS}.
   */
  public constructor(
    private readonly request: APIRequestContext,
    private readonly apiKey: string,
    private readonly knownSecrets: readonly string[] = [],
    private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ) {}

  /**
   * Wykonuje żądanie GET.
   *
   * @param path Ścieżka względna endpointu (np. `/data/3.0/stations`).
   * @param options Opcje żądania (parametry, timeout).
   * @returns Znormalizowana odpowiedź HTTP.
   */
  public get(path: string, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.send('GET', path, options);
  }

  /**
   * Wykonuje żądanie POST z ciałem JSON.
   *
   * @param path Ścieżka względna endpointu.
   * @param options Opcje żądania (ciało, parametry, timeout).
   * @returns Znormalizowana odpowiedź HTTP.
   */
  public post(path: string, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.send('POST', path, options);
  }

  /**
   * Wykonuje żądanie PUT z ciałem JSON.
   *
   * @param path Ścieżka względna endpointu.
   * @param options Opcje żądania (ciało, parametry, timeout).
   * @returns Znormalizowana odpowiedź HTTP.
   */
  public put(path: string, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.send('PUT', path, options);
  }

  /**
   * Wykonuje żądanie DELETE.
   *
   * @param path Ścieżka względna endpointu.
   * @param options Opcje żądania (parametry, timeout).
   * @returns Znormalizowana odpowiedź HTTP.
   */
  public delete(path: string, options: RequestOptions = {}): Promise<ApiResponse> {
    return this.send('DELETE', path, options);
  }

  /**
   * Realizuje żądanie HTTP i normalizuje odpowiedź.
   *
   * Dodaje parametr `appid`, serializuje ciało do JSON, a błędy transportowe
   * zamienia na {@link ApiTransportError} z zredagowaną treścią.
   *
   * @param method Metoda HTTP.
   * @param path Ścieżka względna endpointu.
   * @param options Opcje żądania.
   * @returns Znormalizowana odpowiedź HTTP.
   * @throws {ApiTransportError} Gdy żądanie nie powiedzie się na poziomie transportu.
   */
  private async send(
    method: HttpMethod,
    path: string,
    options: RequestOptions,
  ): Promise<ApiResponse> {
    const params = this.buildParams(options.params);
    const requestOptions: Parameters<APIRequestContext['fetch']>[1] = {
      method,
      params,
      timeout: options.timeoutMs ?? this.timeoutMs,
      headers: { Accept: 'application/json' },
    };
    if (options.body !== undefined) {
      requestOptions.data = JSON.stringify(options.body);
      requestOptions.headers = { ...requestOptions.headers, 'Content-Type': 'application/json' };
    }

    let response: APIResponse;
    try {
      response = await this.request.fetch(path, requestOptions);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ApiTransportError(this.safe(`Żądanie ${method} nie powiodło się: ${message}`));
    }

    return this.normalize(response);
  }

  /**
   * Buduje mapę parametrów zapytania z dołączonym `appid`.
   *
   * @param extra Dodatkowe parametry; wartości `undefined` są pomijane.
   * @returns Mapa parametrów gotowa dla Playwrighta.
   */
  private buildParams(extra?: QueryParams): Record<string, string | number | boolean> {
    const result: Record<string, string | number | boolean> = { appid: this.apiKey };
    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        if (value !== undefined) {
          result[key] = value;
        }
      }
    }
    return result;
  }

  /**
   * Normalizuje odpowiedź Playwrighta do {@link ApiResponse}.
   *
   * Odczytuje ciało jako tekst bez prób parsowania JSON — rozdzielenie odczytu od
   * walidacji pozwala bezpiecznie obsłużyć puste ciało (np. 204).
   *
   * @param response Surowa odpowiedź Playwrighta.
   * @returns Znormalizowana odpowiedź.
   */
  private async normalize(response: APIResponse): Promise<ApiResponse> {
    const rawBody = await response.text();
    const status = response.status();
    return {
      status,
      ok: status >= 200 && status < 300,
      rawBody,
      headers: response.headers(),
    };
  }

  /**
   * Redaguje komunikat diagnostyczny (usuwa `appid` i znane sekrety).
   *
   * @param message Tekst do zredagowania.
   * @returns Bezpieczny do zalogowania tekst.
   */
  private safe(message: string): string {
    return redact(message, this.knownSecrets);
  }
}

/**
 * Parsuje ciało odpowiedzi jako JSON, odrzucając puste ciało.
 *
 * Funkcja celowo NIE rzutuje wyniku na typ domenowy — zwraca `unknown`, aby
 * wymusić walidację schematem jako dowód zgodności kontraktu.
 *
 * @param response Znormalizowana odpowiedź.
 * @returns Sparsowana wartość JSON jako `unknown`.
 * @throws {ApiBodyError} Gdy ciało jest puste lub nie jest poprawnym JSON-em.
 */
export function parseJsonBody(response: ApiResponse): unknown {
  const trimmed = response.rawBody.trim();
  if (trimmed.length === 0) {
    throw new ApiBodyError(
      `Oczekiwano ciała JSON, ale odpowiedź (status ${response.status}) jest pusta.`,
    );
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new ApiBodyError(
      `Ciało odpowiedzi (status ${response.status}) nie jest poprawnym JSON-em.`,
    );
  }
}

/**
 * Informuje, czy odpowiedź ma puste ciało (np. po operacji DELETE → 204).
 *
 * @param response Znormalizowana odpowiedź.
 * @returns `true`, gdy ciało jest puste po przycięciu białych znaków.
 */
export function hasEmptyBody(response: ApiResponse): boolean {
  return response.rawBody.trim().length === 0;
}
