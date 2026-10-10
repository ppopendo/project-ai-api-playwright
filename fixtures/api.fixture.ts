import { test as base, type APIRequestContext } from '@playwright/test';
import { ApiBase } from '../api/ApiBase.js';
import { StationsApi } from '../api/StationsApi.js';
import { WeatherApi } from '../api/WeatherApi.js';
import { collectKnownSecrets, getServiceConfig } from '../config/env.js';
import { ResourceRegistry, assertCleanupSucceeded } from '../helpers/resource-registry.js';

/**
 * Typowane fixtures testowe dla warstwy API.
 *
 * Dostarczają kontekst żądań o zasięgu testu, klientów domenowych oraz rejestr
 * zasobów z automatycznym sprzątaniem. Walidacja konfiguracji (w tym obecności
 * kluczy) następuje przy inicjalizacji fixtures — przed wykonaniem żądań.
 */
export interface ApiFixtures {
  /** Kontekst żądań Playwrighta o zasięgu testu (zwalniany w teardown). */
  stationsContext: APIRequestContext;
  /** Kontekst żądań dla usługi pogody (zwalniany w teardown). */
  weatherContext: APIRequestContext;
  /** Klient Weather Stations API 3.0. */
  stationsApi: StationsApi;
  /** Klient Current Weather Data API 2.5. */
  weatherApi: WeatherApi;
  /** Rejestr zasobów o zasięgu testu z automatycznym sprzątaniem w teardown. */
  registry: ResourceRegistry;
}

/**
 * Rozszerzony obiekt `test` z fixtures API.
 *
 * Każdy test otrzymuje własny kontekst i rejestr, dzięki czemu testy są izolowane
 * i nie zależą od kolejności ani wyniku innych testów.
 */
export const test = base.extend<ApiFixtures>({
  stationsContext: async ({ playwright }, use) => {
    const config = getServiceConfig('stations');
    const context = await playwright.request.newContext({ baseURL: config.baseUrl });
    await use(context);
    await context.dispose();
  },

  weatherContext: async ({ playwright }, use) => {
    const config = getServiceConfig('weather');
    const context = await playwright.request.newContext({ baseURL: config.baseUrl });
    await use(context);
    await context.dispose();
  },

  stationsApi: async ({ stationsContext }, use) => {
    const config = getServiceConfig('stations');
    const secrets = collectKnownSecrets();
    const client = new StationsApi(new ApiBase(stationsContext, config.apiKey, secrets));
    await use(client);
  },

  weatherApi: async ({ weatherContext }, use) => {
    const config = getServiceConfig('weather');
    const secrets = collectKnownSecrets();
    const client = new WeatherApi(new ApiBase(weatherContext, config.apiKey, secrets));
    await use(client);
  },

  registry: async ({ stationsApi }, use) => {
    const registry = new ResourceRegistry(stationsApi);
    await use(registry);
    // Teardown: posprzątaj zasoby utworzone przez test, także po jego błędzie.
    const outcomes = await registry.cleanup();
    assertCleanupSucceeded(outcomes);
  },
});

/** Re-eksport `expect` dla spójnych importów w testach. */
export { expect } from '@playwright/test';
