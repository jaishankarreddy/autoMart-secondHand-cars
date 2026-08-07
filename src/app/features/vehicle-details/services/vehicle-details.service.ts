import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CatalogService, CatalogVehicle } from '../../../services/catalog.service';
import { VehicleDetail } from '../models/vehicle-detail.model';
import { Car } from '../../cars/models/car.model';

/** Data-access seam for the Vehicle Details page backed by the Node API. */
@Injectable({ providedIn: 'root' })
export class VehicleDetailsService {
  private readonly http = inject(HttpClient);
  private readonly catalog = inject(CatalogService);

  private readonly detailSource = signal<VehicleDetail | null>(null);
  private readonly loadingSource = signal(true);
  private readonly currentId = signal<string | null>(null);

  readonly detail = this.detailSource.asReadonly();
  readonly loading = this.loadingSource.asReadonly();

  /** Similar vehicles (same type) resolved reactively from the live catalogue. */
  readonly similar = computed<Car[]>(() => {
    const id = this.currentId();
    const car = this.catalog.cars().find((c) => c.id === id);
    const type = car ? 'car' : 'bike';
    const pool = type === 'car' ? this.catalog.cars() : this.catalog.bikes();
    return pool
      .filter((v) => v.id !== id)
      .slice(0, 6) as unknown as Car[];
  });

  load(id: string): void {
    this.currentId.set(id);
    this.loadingSource.set(true);
    this.catalog.load();

    this.http
      .get<CatalogVehicle>(`/api/vehicles/${id}`)
      .subscribe({
        next: (v) => {
          this.detailSource.set(v as unknown as VehicleDetail);
          this.loadingSource.set(false);
        },
        error: () => {
          // Fall back to the locally-cached catalogue entry if the API fails.
          const cached = this.catalog.byId(id);
          this.detailSource.set(cached ? (cached as unknown as VehicleDetail) : null);
          this.loadingSource.set(false);
        }
      });
  }
}