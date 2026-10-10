import { defineConfig } from '@playwright/test';

/**
 * Konfiguracja Playwright Test dla testów API OpenWeatherMap.
 *
 * Projekty i ich zależności tworzą bramkę health: nieudany health check blokuje
 * zależny projekt live, a cała komenda kończy się kodem niezerowym.
 *
 * Bezpieczeństwo: `trace` jest wyłączony, aby artefakty nie zawierały żądań z
 * parametrem `appid`. Reporter `list` wypisuje wyłącznie tytuły i zredagowane
 * komunikaty błędów — nie zapisuje surowych URL-i ani ciał żądań.
 */
export default defineConfig({
  testDir: './tests',
  // Pełna izolacja i brak multiplikowania operacji mutujących:
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    trace: 'off',
    // API-only: brak przeglądarek, zrzutów ekranu i wideo.
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'health-stations',
      testDir: './tests/health',
      testMatch: /stations\.health\.spec\.ts$/,
    },
    {
      name: 'health-weather',
      testDir: './tests/health',
      testMatch: /weather\.health\.spec\.ts$/,
    },
    {
      name: 'stations',
      testDir: './tests/stations',
      dependencies: ['health-stations'],
    },
    {
      name: 'weather',
      testDir: './tests/weather',
      dependencies: ['health-weather'],
    },
  ],
});
