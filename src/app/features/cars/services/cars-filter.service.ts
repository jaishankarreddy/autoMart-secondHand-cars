import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Car } from '../models/car.model';
import { CatalogService } from '../../../services/catalog.service';

export type CarSortKey =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'mileage'
  | 'year';

export interface CarFilters {
  brands: string[];
  priceMin: number;
  priceMax: number;
  years: number[];
  fuels: string[];
  transmissions: string[];
  owners: number[];
  bodyTypes: string[];
  mileageMax: number;
  districts: string[];
  colors: string[];
}

export interface CarQuery {
  keyword: string;
  sort: CarSortKey;
}

const PRICE_MIN = 5;
const PRICE_MAX = 40;

const DEFAULT_FILTERS: CarFilters = {
  brands: [],
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  years: [],
  fuels: [],
  transmissions: [],
  owners: [],
  bodyTypes: [],
  mileageMax: 24,
  districts: [],
  colors: []
};

/** Distinct values in original order. */
function distinct<T, K>(list: T[], key: (item: T) => K): K[] {
  const seen = new Set<string>();
  const out: K[] = [];
  for (const item of list) {
    const k = key(item);
    const s = String(k);
    if (!seen.has(s)) {
      seen.add(s);
      out.push(k);
    }
  }
  return out;
}

@Injectable({ providedIn: 'root' })
export class CarsFilterService {
  private readonly catalog = inject(CatalogService);

  constructor() {
    this.catalog.load();
  }

  readonly cars: Signal<Car[]> = this.catalog.cars as Signal<Car[]>;
  readonly brands = computed(() => distinct(this.cars(), (c) => c.brand).sort());
  readonly years = computed(() =>
    distinct(this.cars(), (c) => c.year).sort((a, b) => b - a)
  );
  readonly fuels = computed(() => distinct(this.cars(), (c) => c.fuel));
  readonly transmissions = computed(() =>
    distinct(this.cars(), (c) => c.transmission)
  );
  readonly owners = computed(() => distinct(this.cars(), (c) => c.owners).sort());
  readonly bodyTypes = computed(() => distinct(this.cars(), (c) => c.bodyType));
  readonly districts = computed(() =>
    distinct(this.cars(), (c) => c.district).sort()
  );
  readonly colors = computed(() => distinct(this.cars(), (c) => c.color));
  readonly priceMinBound = PRICE_MIN;
  readonly priceMaxBound = PRICE_MAX;

  readonly filters = signal<CarFilters>({ ...DEFAULT_FILTERS });
  readonly query = signal<CarQuery>({ keyword: '', sort: 'newest' });
  readonly page = signal(1);
  readonly gridView = signal<'grid' | 'list'>('grid');
  readonly wishlist = signal<Set<string>>(new Set());
  readonly pageSize = 8;

  readonly activeFilterCount = computed(() => {
    const f = this.filters();
    return (
      f.brands.length +
      (f.priceMax < PRICE_MAX ? 1 : 0) +
      (f.priceMin > PRICE_MIN ? 1 : 0) +
      f.years.length +
      f.fuels.length +
      f.transmissions.length +
      f.owners.length +
      f.bodyTypes.length +
      (f.mileageMax < 24 ? 1 : 0) +
      f.districts.length +
      f.colors.length +
      (this.query().keyword ? 1 : 0)
    );
  });

  readonly filtered = computed(() => {
    const f = this.filters();
    const q = this.query();
    let list = this.cars();

    if (q.keyword.trim()) {
      const kw = q.keyword.trim().toLowerCase();
      list = list.filter((c) =>
        `${c.brand} ${c.model} ${c.variant} ${c.district}`
          .toLowerCase()
          .includes(kw)
      );
    }
    if (f.brands.length) list = list.filter((c) => f.brands.includes(c.brand));
    if (f.years.length) list = list.filter((c) => f.years.includes(c.year));
    if (f.fuels.length) list = list.filter((c) => f.fuels.includes(c.fuel));
    if (f.transmissions.length)
      list = list.filter((c) => f.transmissions.includes(c.transmission));
    if (f.owners.length) list = list.filter((c) => f.owners.includes(c.owners));
    if (f.bodyTypes.length)
      list = list.filter((c) => f.bodyTypes.includes(c.bodyType));
    if (f.districts.length)
      list = list.filter((c) => f.districts.includes(c.district));
    if (f.colors.length) list = list.filter((c) => f.colors.includes(c.color));
    if (f.priceMin > PRICE_MIN || f.priceMax < PRICE_MAX)
      list = list.filter((c) => c.priceInLakh >= f.priceMin && c.priceInLakh <= f.priceMax);
    if (f.mileageMax < 24) list = list.filter((c) => c.mileage <= f.mileageMax);

    const sorted = [...list].sort((a, b) => {
      switch (q.sort) {
        case 'price-asc': return a.priceInLakh - b.priceInLakh;
        case 'price-desc': return b.priceInLakh - a.priceInLakh;
        case 'mileage': return b.mileage - a.mileage;
        case 'year': return b.year - a.year;
        default: return Number(b.id.replace(/\D/g, '')) - Number(a.id.replace(/\D/g, '')) || b.year - a.year;
      }
    });
    return sorted;
  });

  readonly totalCount = computed(() => this.filtered().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize))
  );

  readonly pagedCars = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const pages: (number | 'ellipsis')[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (current > 3) pages.push('ellipsis');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('ellipsis');
    pages.push(total);
    return pages;
  });

  readonly pageRange = computed(() => {
    if (!this.totalCount()) return { from: 0, to: 0 };
    const from = (this.page() - 1) * this.pageSize + 1;
    const to = Math.min(this.page() * this.pageSize, this.totalCount());
    return { from, to };
  });

  readonly isFiltered = computed(() => this.activeFilterCount() > 0);

  updateFilters(partial: Partial<CarFilters>): void {
    this.filters.update((f) => ({ ...f, ...partial }));
    this.page.set(1);
  }

  setKeyword(keyword: string): void {
    this.query.update((q) => ({ ...q, keyword }));
    this.page.set(1);
  }

  setSort(sort: CarSortKey): void {
    this.query.update((q) => ({ ...q, sort }));
    this.page.set(1);
  }

  setPage(page: number): void {
    const clamped = Math.min(Math.max(1, page), this.totalPages());
    this.page.set(clamped);
  }

  setGridView(view: 'grid' | 'list'): void {
    this.gridView.set(view);
  }

  toggleWishlist(id: string): void {
    this.wishlist.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  resetFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
    this.page.set(1);
  }

  resetAll(): void {
    this.resetFilters();
    this.query.set({ keyword: '', sort: 'newest' });
  }
}