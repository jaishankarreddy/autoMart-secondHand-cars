import { Injectable, computed, inject, signal } from '@angular/core';
import { Car } from '../../cars/models/car.model';
import { Bike } from '../../bikes/models/bike.model';
import { CatalogService, CatalogVehicle } from '../../../services/catalog.service';
import { ToastService } from '../../../services/toast.service';

const STORAGE_KEY = 'automart-compare';

function readStored(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export interface ComparableVehicle {
  id: string;
  type: 'car' | 'bike';
  brand: string;
  model: string;
  variant: string;
  year: number;
  priceInLakh: number;
  fuel: string;
  transmission: string;
  engine: string;
  mileage: number;
  mileageUnit: string;
  abs: string;
  bodyType: string;
  color: string;
  district: string;
  owners: number;
  kilometers: number;
  image: string;
  rating?: number;
  featured?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CompareService {
  private readonly catalogService = inject(CatalogService);
  private readonly toast = inject(ToastService);

  constructor() {
    this.catalogService.load();
  }

  readonly max = 3;

  readonly ids = signal<string[]>(readStored());

  readonly vehicles = computed<ComparableVehicle[]>(() =>
    this.ids()
      .map((id) => this.lookup(id))
      .filter((v): v is ComparableVehicle => !!v)
  );

  readonly count = computed(() => this.vehicles().length);
  readonly full = computed(() => this.count() >= this.max);

  readonly bestPrice = computed(() => {
    const list = this.vehicles();
    return list.length ? Math.min(...list.map((v) => v.priceInLakh)) : null;
  });

  readonly catalog = computed(() => {
    const cars = this.catalogService.cars().map((c) => this.toComparable(c, 'car'));
    const bikes = this.catalogService.bikes().map((b) => this.toComparable(b, 'bike'));
    return [...cars, ...bikes];
  });

  toggle(id: string, opts?: { silent?: boolean }): void {
    let added = false;
    this.ids.update((ids) => {
      if (ids.includes(id)) {
        return ids.filter((i) => i !== id);
      }
      if (ids.length >= this.max) {
        this.toast.error('Compare list is full', `You can compare up to ${this.max} vehicles. Remove one first.`);
        return ids;
      }
      added = true;
      return [...ids, id];
    });
    if (!opts?.silent) {
      if (added) this.toast.success('Added to compare', 'Open the compare bar to view them side by side.');
      else this.toast.info('Removed from compare');
    }
    this.persist();
  }

  remove(id: string): void {
    this.ids.update((ids) => ids.filter((i) => i !== id));
    this.persist();
  }

  clear(): void {
    this.ids.set([]);
    this.persist();
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids()));
    } catch {
      /* storage may be unavailable (private mode) — ignore */
    }
  }

  private lookup(id: string): ComparableVehicle | null {
    const v = this.catalogService.byId(id);
    if (!v) return null;
    return this.toComparable(v, v.vehicleType);
  }

  private toComparable(v: CatalogVehicle, type: 'car' | 'bike'): ComparableVehicle {
    if (type === 'bike') {
      return {
        id: v.id,
        type,
        brand: v.brand,
        model: v.model,
        variant: v.variant,
        year: v.year,
        priceInLakh: v.priceInLakh,
        fuel: v.fuel,
        transmission: v.engineCC ? 'Manual' : 'Electric',
        engine: v.engineCC && v.engineCC > 0 ? `${v.engineCC} cc` : 'Electric',
        mileage: v.mileage,
        mileageUnit: v.fuel === 'Electric' ? 'km/charge' : 'km/l',
        abs: v.abs ? 'Yes' : 'No',
        bodyType: v.bodyType,
        color: v.color,
        district: v.district,
        owners: v.owners,
        kilometers: v.kilometers,
        image: v.image,
        rating: v.rating,
        featured: v.featured
      };
    }
    const c = v as unknown as Car;
    return {
      id: c.id,
      type,
      brand: c.brand,
      model: c.model,
      variant: c.variant,
      year: c.year,
      priceInLakh: c.priceInLakh,
      fuel: c.fuel,
      transmission: c.transmission,
      engine: '—',
      mileage: c.mileage,
      mileageUnit: 'km/l',
      abs: '—',
      bodyType: c.bodyType,
      color: c.color,
      district: c.district,
      owners: c.owners,
      kilometers: c.kilometers,
      image: c.image,
      rating: c.rating,
      featured: c.featured
    };
  }
}