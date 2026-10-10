import type { ApiResponse } from '../models/api.models.js';
import type { WeatherQueryInput } from '../models/weather.models.js';
import type { ApiBase } from './ApiBase.js';

/** Ścieżka Current Weather Data API 2.5. */
const WEATHER_PATH = '/data/2.5/weather';

/**
 * Klient domenowy Current Weather Data API 2.5.
 *
 * Udostępnia odczyt aktualnej pogody po nazwie miasta. Metody zwracają
 * znormalizowaną odpowiedź {@link ApiResponse} — walidacja należy do testów.
 */
export class WeatherApi {
  /**
   * @param api Bazowy klient HTTP z wstrzykniętym kontekstem i kluczem pogody.
   */
  public constructor(private readonly api: ApiBase) {}

  /**
   * Pobiera aktualną pogodę dla miasta podanego po nazwie.
   *
   * Buduje parametr `q` jako `miasto` lub `miasto,kodKraju` i dołącza opcjonalne
   * `units` oraz `lang`. Uwierzytelnienie (`appid`) dodaje warstwa bazowa.
   *
   * @param input Parametry zapytania o pogodę.
   * @returns Odpowiedź z aktualną pogodą (oczekiwany status 200) lub błąd 404.
   */
  public getCurrentWeatherByCity(input: WeatherQueryInput): Promise<ApiResponse> {
    const q = input.countryCode ? `${input.city},${input.countryCode}` : input.city;
    return this.api.get(WEATHER_PATH, {
      params: {
        q,
        units: input.units,
        lang: input.lang,
      },
    });
  }
}
