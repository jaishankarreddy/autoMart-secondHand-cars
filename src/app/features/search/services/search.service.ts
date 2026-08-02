import { Injectable, computed, signal } from '@angular/core';
import { Car } from '../../cars/models/car.model';
import { Bike } from '../../bikes/models/bike.model';
import { CARS } from '../../cars/data/cars.data';
import { BIKES } from '../../bikes/data/bikes.data';

export type SearchVehicleType = 'all' | 'car' | 'bike';

const BUDGET_MAX = 25;

@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly keyword = signal('');
  readonly type = signal<SearchVehicleType>('all');
  readonly brand = signal('');
  readonly budget = signal('');
  readonly fuel = signal('');

  readonly brands = computed(() => {
    const set = new Set<string>();
    for (const c of CARS) set.add(c.brand);
    for (const b of BIKES) set.add(b.brand);
    return [...set].sort();
  });

  readonly fuels = computed(() => {
    const set = new Set<string>();
    for (const c of CARS) set.add(c.fuel);
    for (const b of BIKES) set.add(b.fuel);
    return [...set];
  });

  readonly cars = computed(() => this.applyFilters(CARS) as Car[]);
  readonly bikes = computed(() => this.applyFilters(BIKES) as Bike[]);

  readonly totalCount = computed(() => this.cars().length + this.bikes().length);

  readonly activeFilterCount = computed(() =>
    (this.keyword().trim() ? 1 : 0) +
    (this.type() !== 'all' ? 1 : 0) +
    (this.brand() ? 1 : 0) +
    (this.budget() ? 1 : 0) +
    (this.fuel() ? 1 : 0)
  );

  readonly isFiltered = computed(() => this.activeFilterCount() > 0);

  reset(): void {
    this.keyword.set('');
    this.type.set('all');
    this.brand.set('');
    this.budget.set('');
    this.fuel.set('');
  }

  private applyFilters(list: (Car | Bike)[]): (Car | Bike)[] {
    const kw = this.keyword().trim().toLowerCase();
    const type = this.type();
    const brand = this.brand();
    const budget = this.budget();
    const fuel = this.fuel();

    return list.filter((v) => {
      if (type === 'car' && !('transmission' in v)) return false;
      if (type === 'bike' && 'transmission' in v) return false;
      if (brand && v.brand !== brand) return false;
      if (fuel && v.fuel !== fuel) return false;
      if (budget && !this.matchesBudget(v.priceInLakh, budget)) return false;
      if (kw) {
        const hay = `${v.brand} ${v.model} ${v.variant} ${v.bodyType} ${v.fuel} ${v.district}`
          .toLowerCase();
        if (!kw.split(/\s+/).every((part) => hay.includes(part))) return false;
      }
      return true;
    });
  }

  private matchesBudget(price: number, range: string): boolean {
    switch (range) {
      case '0-5': return price >= 0 && price < 5;
      case '5-10': return price >= 5 && price < 10;
      case '10-15': return price >= 10 && price < 15;
      case '15-25': return price >= 15 && price < BUDGET_MAX;
      case '25+': return price >= BUDGET_MAX;
      default: return true;
    }
  }
}
