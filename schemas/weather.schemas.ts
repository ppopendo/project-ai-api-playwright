import { z } from 'zod';

/**
 * Schematy walidacji odpowiedzi Current Weather Data API 2.5.
 *
 * API zwraca więcej pól niż jest przedmiotem asercji, dlatego schematy nie są
 * `strict()` — walidują obecność i typy pól istotnych dla kontraktu, dopuszczając
 * dodatkowe pola.
 */

/** Współrzędne lokalizacji. */
export const coordSchema = z.object({
  lon: z.number(),
  lat: z.number(),
});

/** Pojedynczy warunek pogodowy. */
export const weatherConditionSchema = z.object({
  id: z.number(),
  main: z.string(),
  description: z.string(),
  icon: z.string(),
});

/** Główne parametry pogodowe. */
export const weatherMainSchema = z.object({
  temp: z.number(),
  feels_like: z.number(),
  temp_min: z.number(),
  temp_max: z.number(),
  pressure: z.number(),
  humidity: z.number(),
});

/** Parametry wiatru. */
export const windSchema = z.object({
  speed: z.number(),
  deg: z.number(),
});

/** Dane systemowe odpowiedzi. */
export const weatherSysSchema = z.object({
  country: z.string().optional(),
  sunrise: z.number().optional(),
  sunset: z.number().optional(),
});

/** Schemat pełnej odpowiedzi aktualnej pogody. */
export const currentWeatherSchema = z.object({
  coord: coordSchema,
  weather: z.array(weatherConditionSchema).min(1),
  main: weatherMainSchema,
  wind: windSchema,
  sys: weatherSysSchema,
  id: z.number(),
  name: z.string(),
  cod: z.number(),
});

/** Schemat odpowiedzi błędu pogody (np. 404 nieznane miasto). */
export const weatherErrorSchema = z.object({
  cod: z.union([z.number(), z.string()]),
  message: z.string(),
});
