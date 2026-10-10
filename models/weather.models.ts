/**
 * Modele domenowe Current Weather Data API 2.5.
 */

/** Obsługiwane układy jednostek odczytu pogody. */
export type WeatherUnits = 'standard' | 'metric' | 'imperial';

/**
 * Dane wejściowe zapytania o aktualną pogodę po nazwie miasta
 * (`GET /data/2.5/weather`).
 */
export interface WeatherQueryInput {
  /** Nazwa miasta, opcjonalnie z kodem kraju ISO 3166 (np. "London,GB"). */
  readonly city: string;
  /** Kod kraju ISO 3166 (np. "GB"); dołączany do zapytania `q`. */
  readonly countryCode?: string;
  /** Układ jednostek (temperatura, prędkość wiatru). */
  readonly units?: WeatherUnits;
  /** Język opisów pogody (kod ISO 639-1, np. "pl"). */
  readonly lang?: string;
}

/** Współrzędne geograficzne lokalizacji. */
export interface Coord {
  /** Długość geograficzna. */
  readonly lon: number;
  /** Szerokość geograficzna. */
  readonly lat: number;
}

/** Pojedynczy warunek pogodowy. */
export interface WeatherCondition {
  /** Identyfikator warunku pogodowego. */
  readonly id: number;
  /** Grupa pogodowa (np. "Clouds", "Rain"). */
  readonly main: string;
  /** Opis warunku w żądanym języku. */
  readonly description: string;
  /** Kod ikony pogodowej. */
  readonly icon: string;
}

/** Główne parametry pogodowe. */
export interface WeatherMain {
  /** Temperatura w żądanych jednostkach. */
  readonly temp: number;
  /** Temperatura odczuwalna. */
  readonly feels_like: number;
  /** Minimalna temperatura w chwili pomiaru. */
  readonly temp_min: number;
  /** Maksymalna temperatura w chwili pomiaru. */
  readonly temp_max: number;
  /** Ciśnienie atmosferyczne (hPa). */
  readonly pressure: number;
  /** Wilgotność względna (%). */
  readonly humidity: number;
}

/** Parametry wiatru. */
export interface Wind {
  /** Prędkość wiatru w jednostkach zależnych od układu. */
  readonly speed: number;
  /** Kierunek wiatru w stopniach. */
  readonly deg: number;
}

/** Dane systemowe odpowiedzi pogodowej. */
export interface WeatherSys {
  /** Kod kraju ISO 3166 lokalizacji. */
  readonly country?: string;
  /** Czas wschodu słońca (unix UTC). */
  readonly sunrise?: number;
  /** Czas zachodu słońca (unix UTC). */
  readonly sunset?: number;
}

/**
 * Odpowiedź z aktualną pogodą dla lokalizacji.
 *
 * Zawiera tylko pola istotne dla testów kontraktu; API może zwracać więcej pól,
 * które nie są przedmiotem asercji.
 */
export interface CurrentWeather {
  /** Współrzędne zidentyfikowanej lokalizacji. */
  readonly coord: Coord;
  /** Lista warunków pogodowych. */
  readonly weather: WeatherCondition[];
  /** Główne parametry pogodowe. */
  readonly main: WeatherMain;
  /** Parametry wiatru. */
  readonly wind: Wind;
  /** Dane systemowe (m.in. kod kraju). */
  readonly sys: WeatherSys;
  /** Identyfikator miasta w bazie OpenWeatherMap. */
  readonly id: number;
  /** Nazwa zidentyfikowanego miasta. */
  readonly name: string;
  /** Wewnętrzny kod odpowiedzi (zwykle równy statusowi HTTP). */
  readonly cod: number;
}
