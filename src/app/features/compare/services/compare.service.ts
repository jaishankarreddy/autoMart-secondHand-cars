import { Injectable, computed, inject, signal } from '@angular/core';
import { Car } from '../../cars/models/car.model';
import { Bike } from '../../bikes/models/bike.model';
import { CatalogService, CatalogVehicle } from '../../../services/catalog.service';

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

  constructor() {
    this.catalogService.load();
  }

  readonly max = 3;

  readonly ids = signal<string[]>([]);

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

  toggle(id: string): void {
    this.ids.update((ids) => {
      if (ids.includes(id)) {
        return ids.filter((i) => i !== id);
      }
      if (ids.length >= this.max) {
        return ids;
      }
      return [...ids, id];
    });
  }

  remove(id: string): void {
    this.ids.update((ids) => ids.filter((i) => i !== id));
  }

  clear(): void {
    this.ids.set([]);
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