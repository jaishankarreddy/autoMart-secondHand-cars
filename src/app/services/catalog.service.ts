import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/** Shape returned by the Node backend `/api/vehicles` documents. */
export interface CatalogVehicle {
  id: string;
  vehicleType: 'car' | 'bike';
  brand: string;
  model: string;
  variant: string;
  year: number;
  priceInLakh: number;
  fuel: string;
  transmission: string;
  mileage: number;
  kilometers: number;
  district: string;
  location?: string;
  owners: number;
  bodyType: string;
  color: string;
  image: string;
  images?: string[];
  engineCC?: number;
  abs?: boolean;
  engine?: string;
  power?: string;
  registration?: string;
  insurance?: string;
  availability?: 'available' | 'reserved' | 'sold';
  featured?: boolean;
  rating?: number;
  description?: string[];
  features?: { key: string; icon?: string; title: string; items: string[] }[];
  seller?: {
    name: string;
    verified: boolean;
    hours?: string;
    location?: string;
    phone?: string;
    whatsapp?: string;
    deals?: number;
  };
}

const API_URL = '/api';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  private readonly data = signal<CatalogVehicle[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private startedLoad = false;

  readonly vehicles = this.data.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly cars = computed(() => this.data().filter((v) => v.vehicleType === 'car'));
  readonly bikes = computed(() => this.data().filter((v) => v.vehicleType === 'bike'));
  readonly featuredCars = computed(() => this.cars().filter((c) => c.featured));
  readonly featuredBikes = computed(() => this.bikes().filter((b) => b.featured));

  /** Brand list derived from live catalogue. */
  readonly brands = computed(() => {
    const set = new Set<string>();
    for (const v of this.data()) set.add(v.brand);
    return [...set].sort();
  });

  /** Loads the full catalogue once (idempotent, single in-flight request). */
  load(): void {
    if (this.startedLoad || this.loadingSignal()) return;
    this.startedLoad = true;
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    Promise.all([this.fetchPage('car'), this.fetchPage('bike')])
      .then(([cars, bikes]) => {
        this.data.set([...cars, ...bikes]);
        this.loadingSignal.set(false);
      })
      .catch((err: unknown) => {
        this.errorSignal.set(
          err instanceof Error ? err.message : 'Failed to load catalogue from API'
        );
        this.loadingSignal.set(false);
      });
  }

  byId(id: string): CatalogVehicle | undefined {
    return this.data().find((v) => v.id === id);
  }

  private async fetchPage(type: string): Promise<CatalogVehicle[]> {
    const page = await firstValueFrom(
      this.http.get<{ items: CatalogVehicle[] }>(`${API_URL}/vehicles?type=${type}&limit=200`)
    );
    return page?.items ?? [];
  }
}