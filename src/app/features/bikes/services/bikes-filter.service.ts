import { Injectable, computed, signal } from '@angular/core';
import { Bike } from '../models/bike.model';
import {
  BIKES,
  BIKE_BRANDS,
  BIKE_FUELS,
  BIKE_MILEAGE_MAX,
  BIKE_MODELS,
  BIKE_OWNERS,
  ENGINE_CC_MAX,
  ENGINE_CC_MIN
} from '../data/bikes.data';

export type BikeSortKey =
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'mileage'
  | 'year';

export interface BikeFilters {
  brands: string[];
  models: string[];
  ccMin: number;
  ccMax: number;
  /** 'With ABS' | 'Without ABS' */
  absOptions: string[];
  mileageMax: number;
  fuels: string[];
  owners: number[];
}

export interface BikeQuery {
  keyword: string;
  sort: BikeSortKey;
}

const DEFAULT_FILTERS: BikeFilters = {
  brands: [],
  models: [],
  ccMin: ENGINE_CC_MIN,
  ccMax: ENGINE_CC_MAX,
  absOptions: [],
  mileageMax: BIKE_MILEAGE_MAX,
  fuels: [],
  owners: []
};

@Injectable({ providedIn: 'root' })
export class BikesFilterService {
  readonly bikes = BIKES;
  readonly brands = BIKE_BRANDS;
  readonly models = BIKE_MODELS;
  readonly fuels = BIKE_FUELS;
  readonly owners = BIKE_OWNERS;
  readonly ccMinBound = ENGINE_CC_MIN;
  readonly ccMaxBound = ENGINE_CC_MAX;
  readonly mileageBound = BIKE_MILEAGE_MAX;

  readonly filters = signal<BikeFilters>({ ...DEFAULT_FILTERS });
  readonly query = signal<BikeQuery>({ keyword: '', sort: 'newest' });
  readonly page = signal(1);
  readonly gridView = signal<'grid' | 'list'>('grid');
  readonly wishlist = signal<Set<string>>(new Set());
  readonly pageSize = 8;

  readonly activeFilterCount = computed(() => {
    const f = this.filters();
    return (
      f.brands.length +
      f.models.length +
      (f.ccMin > ENGINE_CC_MIN || f.ccMax < ENGINE_CC_MAX ? 1 : 0) +
      f.absOptions.length +
      (f.mileageMax < BIKE_MILEAGE_MAX ? 1 : 0) +
      f.fuels.length +
      f.owners.length +
      (this.query().keyword ? 1 : 0)
    );
  });

  readonly filtered = computed(() => {
    const f = this.filters();
    const q = this.query();
    let list = this.bikes;

    if (q.keyword.trim()) {
      const kw = q.keyword.trim().toLowerCase();
      list = list.filter((b) =>
        `${b.brand} ${b.model} ${b.variant} ${b.bodyType} ${b.district}`
          .toLowerCase()
          .includes(kw)
      );
    }
    if (f.brands.length) list = list.filter((b) => f.brands.includes(b.brand));
    if (f.models.length) list = list.filter((b) => f.models.includes(b.model));
    if (f.fuels.length) list = list.filter((b) => f.fuels.includes(b.fuel));
    if (f.owners.length) list = list.filter((b) => f.owners.includes(b.owners));
    if (f.absOptions.length === 1) {
      const withAbs = f.absOptions[0] === 'With ABS';
      list = list.filter((b) => b.abs === withAbs);
    }
    if (f.ccMin > ENGINE_CC_MIN || f.ccMax < ENGINE_CC_MAX) {
      list = list.filter((b) => b.engineCC >= f.ccMin && b.engineCC <= f.ccMax);
    }
    if (f.mileageMax < BIKE_MILEAGE_MAX) {
      list = list.filter((b) =>
        b.fuel === 'Electric' ? true : b.mileage <= f.mileageMax
      );
    }

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

  readonly pagedBikes = computed(() => {
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

  updateFilters(partial: Partial<BikeFilters>): void {
    this.filters.update((f) => ({ ...f, ...partial }));
    this.page.set(1);
  }

  setKeyword(keyword: string): void {
    this.query.update((q) => ({ ...q, keyword }));
    this.page.set(1);
  }

  setSort(sort: BikeSortKey): void {
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
