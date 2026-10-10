import type { StationsApi } from '../api/StationsApi.js';
import { hasEmptyBody } from '../api/ApiBase.js';

/** Wynik sprzątania pojedynczego zasobu. */
export interface CleanupOutcome {
  /** Identyfikator sprzątanego zasobu. */
  readonly id: string;
  /** Status operacji sprzątania. */
  readonly status: 'deleted' | 'already-absent' | 'error';
  /** Szczegóły błędu, gdy `status === 'error'`. */
  readonly detail?: string;
}

/**
 * Rejestr zasobów o zasięgu pojedynczego testu.
 *
 * Przechowuje identyfikatory stacji utworzonych przez test lub health probe i
 * zapewnia ich usunięcie w teardown — także po błędzie testu. Usuwane są wyłącznie
 * zasoby zarejestrowane tutaj; rejestr nigdy nie kasuje cudzych ani niewłasnych
 * zasobów konta.
 */
export class ResourceRegistry {
  private readonly stationIds = new Set<string>();

  /**
   * @param stations Klient stacji używany do usuwania zarejestrowanych zasobów.
   */
  public constructor(private readonly stations: StationsApi) {}

  /**
   * Rejestruje identyfikator utworzonej stacji do późniejszego sprzątania.
   *
   * Należy wywołać natychmiast po skutecznym utworzeniu, zanim test wykona dalsze
   * asercje — dzięki temu zasób zostanie posprzątany nawet przy późniejszym błędzie.
   *
   * @param id Identyfikator stacji nadany przez serwer.
   */
  public registerStation(id: string): void {
    this.stationIds.add(id);
  }

  /**
   * Usuwa identyfikator z rejestru, np. gdy test sam potwierdził usunięcie stacji.
   *
   * @param id Identyfikator stacji do wyrejestrowania.
   */
  public unregisterStation(id: string): void {
    this.stationIds.delete(id);
  }

  /** Liczba aktualnie zarejestrowanych stacji. */
  public get size(): number {
    return this.stationIds.size;
  }

  /**
   * Sprząta wszystkie zarejestrowane stacje.
   *
   * Dla każdej stacji wykonuje DELETE. Status 204 oznacza usunięcie, a 404 jest
   * traktowany jako idempotentny (zasób już nie istnieje). Inne błędy są zbierane
   * i zwracane — nie mogą zostać po cichu pominięte. Metoda nie rzuca wyjątku, aby
   * nie przesłonić pierwotnego błędu testu; raportowanie należy do wywołującego.
   *
   * @returns Lista wyników sprzątania dla każdego zasobu.
   */
  public async cleanup(): Promise<CleanupOutcome[]> {
    const outcomes: CleanupOutcome[] = [];
    for (const id of this.stationIds) {
      try {
        const response = await this.stations.deleteStation(id);
        if (response.status === 204 && hasEmptyBody(response)) {
          outcomes.push({ id, status: 'deleted' });
        } else if (response.status === 404) {
          outcomes.push({ id, status: 'already-absent' });
        } else {
          outcomes.push({
            id,
            status: 'error',
            detail: `Nieoczekiwany status usuwania: ${response.status}`,
          });
        }
      } catch (error) {
        outcomes.push({
          id,
          status: 'error',
          detail: error instanceof Error ? error.message : String(error),
        });
      }
    }
    this.stationIds.clear();
    return outcomes;
  }
}

/**
 * Zgłasza wyjątkiem błędy sprzątania, jeśli wystąpiły.
 *
 * Używane w teardown po zakończeniu testu: jeśli którykolwiek zasób nie został
 * posprzątany z powodu nieoczekiwanego błędu, informacja musi być widoczna.
 *
 * @param outcomes Wyniki sprzątania z {@link ResourceRegistry.cleanup}.
 * @throws {Error} Gdy którykolwiek wynik ma status `error`.
 */
export function assertCleanupSucceeded(outcomes: readonly CleanupOutcome[]): void {
  const failures = outcomes.filter((o) => o.status === 'error');
  if (failures.length > 0) {
    const details = failures.map((f) => `${f.id}: ${f.detail ?? 'nieznany błąd'}`).join('; ');
    throw new Error(`Sprzątanie nie powiodło się dla ${failures.length} zasobów: ${details}`);
  }
}
