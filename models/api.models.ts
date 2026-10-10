/**
 * Wspólne, niezależne od domeny typy używane przez warstwę API.
 */

/** Dozwolone metody HTTP obsługiwane przez {@link ApiBase}. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Wartości dopuszczalne jako parametry zapytania (query string). */
export type QueryValue = string | number | boolean;

/** Mapa parametrów zapytania dołączanych do żądania. */
export type QueryParams = Record<string, QueryValue | undefined>;

/**
 * Znormalizowana odpowiedź HTTP zwracana przez {@link ApiBase}.
 *
 * Rozdziela surowe dane odpowiedzi od ich walidacji schematem — pola `status`
 * i `body` są dostępne niezależnie od tego, czy ciało jest poprawnym JSON-em.
 */
export interface ApiResponse {
  /** Kod statusu HTTP (np. 200, 201, 404). */
  readonly status: number;
  /** Czy status należy do zakresu 2xx. */
  readonly ok: boolean;
  /** Surowe ciało odpowiedzi jako tekst (może być puste). */
  readonly rawBody: string;
  /** Nagłówki odpowiedzi (nazwy znormalizowane do małych liter). */
  readonly headers: Record<string, string>;
}

/**
 * Opcje pojedynczego żądania HTTP.
 */
export interface RequestOptions {
  /** Parametry zapytania dołączane do URL (poza automatycznie dodawanym `appid`). */
  readonly params?: QueryParams;
  /** Ciało żądania serializowane do JSON (dla POST/PUT). */
  readonly body?: unknown;
  /** Nadpisanie domyślnego timeoutu żądania w milisekundach. */
  readonly timeoutMs?: number;
}
