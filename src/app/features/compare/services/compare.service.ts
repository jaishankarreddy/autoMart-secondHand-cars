import { Injectable, computed, signal } from '@angular/core';
import { Car } from '../../cars/models/car.model';
import { Bike } from '../../bikes/models/bike.model';
import { CARS } from '../../cars/data/cars.data';
import { BIKES } from '../../bikes/data/bikes.data';

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
    const cars = CARS.map((c) => this.toComparable(c, 'car'));
    const bikes = BIKES.map((b) => this.toComparable(b, 'bike'));
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
    const car = CARS.find((c) => c.id === id);
    if (car) return this.toComparable(car, 'car');
    const bike = BIKES.find((b) => b.id === id);
    if (bike) return this.toComparable(bike, 'bike');
    return null;
  }

  private toComparable(v: Car | Bike, type: 'car' | 'bike'): ComparableVehicle {
    if ('transmission' in v) {
      const car = v;
      return {
        id: car.id,
        type,
        brand: car.brand,
        model: car.model,
        variant: car.variant,
        year: car.year,
        priceInLakh: car.priceInLakh,
        fuel: car.fuel,
        transmission: car.transmission,
        engine: '—',
        mileage: car.mileage,
        mileageUnit: 'km/l',
        abs: '—',
        bodyType: car.bodyType,
        color: car.color,
        district: car.district,
        owners: car.owners,
        kilometers: car.kilometers,
        image: car.image,
        rating: car.rating,
        featured: car.featured
      };
    }
    const bike = v as Bike;
    return {
      id: bike.id,
      type,
      brand: bike.brand,
      model: bike.model,
      variant: bike.variant,
      year: bike.year,
      priceInLakh: bike.priceInLakh,
      fuel: bike.fuel,
      transmission: bike.engineCC === 0 ? 'Electric' : 'Manual',
      engine: bike.engineCC > 0 ? `${bike.engineCC} cc` : 'Electric',
      mileage: bike.mileage,
      mileageUnit: bike.fuel === 'Electric' ? 'km/charge' : 'km/l',
      abs: bike.abs ? 'Yes' : 'No',
      bodyType: bike.bodyType,
      color: bike.color,
      district: bike.district,
      owners: bike.owners,
      kilometers: bike.kilometers,
      image: bike.image,
      rating: bike.rating,
      featured: bike.featured
    };
  }
}
