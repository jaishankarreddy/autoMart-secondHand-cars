import { Injectable, computed, signal } from '@angular/core';
import { VEHICLE_DETAILS } from '../data/vehicle-details.data';
import { VehicleDetail } from '../models/vehicle-detail.model';
import { Car } from '../../cars/models/car.model';
import { CARS } from '../../cars/data/cars.data';

/** Data-access seam for the Vehicle Details page.
 *
 *  Today it resolves the vehicle from static dummy JSON. To consume a real
 *  backend later, replace `resolveDetail` / `resolveSimilar` internals with
 *  HttpClient calls (e.g. `this.http.get<VehicleDetail>('/api/vehicles/' + id)`)
 *  while keeping the same emitted shapes — no component template changes needed.
 */
@Injectable({ providedIn: 'root' })
export class VehicleDetailsService {
  private readonly detailSource = signal<VehicleDetail | null>(null);
  private readonly similarSource = signal<Car[]>([]);
  private readonly loadingSource = signal(true);

  /** Reactive handles that components consume. In a real integration these would
   *  come from `toSignal(this.http.get<VehicleDetail>('/api/vehicles/:id'))`
   *  and a similar endpoint. */
  readonly detail = this.detailSource.asReadonly();
  readonly similar = this.similarSource.asReadonly();
  readonly loading = this.loadingSource.asReadonly();

  load(id: string): void {
    this.loadingSource.set(true);
    // Dummy async resolution; swap the bodies of resolveDetail/resolveSimilar
    // for HttpClient calls and the component tree keeps working unchanged.
    queueMicrotask(() => {
      this.detailSource.set(this.resolveDetail(id));
      this.similarSource.set(this.resolveSimilar(id));
      this.loadingSource.set(false);
    });
  }

  /** Dummy resolver — swap for `this.http.get<VehicleDetail>('/api/vehicles/' + id)`. */
  private resolveDetail(id: string): VehicleDetail {
    return VEHICLE_DETAILS.find((v) => v.id === id) ?? VEHICLE_DETAILS[0];
  }

  /** Dummy resolver — swap for `this.http.get<Car[]>('/api/vehicles/:id/similar')`. */
  private resolveSimilar(id: string): Car[] {
    const pool = CARS.filter((c) => c.id !== id);
    return pool.slice(0, 6);
  }
}
