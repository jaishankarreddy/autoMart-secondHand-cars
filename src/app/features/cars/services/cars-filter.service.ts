import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Car } from '../models/car.model';
import { CatalogService, CatalogVehicle } from '../../../services/catalog.service';
import { API_BASE } from '@config/api';

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

/** Sentinels used to detect "no price filter applied". */
const PRICE_MIN = 5;
const PRICE_MAX = 40;
const MILEAGE_MAX = 24;

const DEFAULT_FILTERS: CarFilters = {
  brands: [],
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  years: [],
  fuels: [],
  transmissions: [],
  owners: [],
  bodyTypes: [],
  mileageMax: MILEAGE_MAX,
  districts: [],
  colors: []
};

interface VehicleFacets {
  brands: string[];
  years: number[];
  fuels: string[];
  transmissions: string[];
  owners: number[];
  bodyTypes: string[];
  districts: string[];
  colors: string[];
  priceMin: number;
  priceMax: number;
}

const EMPTY_FACETS: VehicleFacets = {
  brands: [], years: [], fuels: [], transmissions: [], owners: [],
  bodyTypes: [], districts: [], colors: [], priceMin: PRICE_MIN, priceMax: PRICE_MAX
};

const SORT_MAP: Record<CarSortKey, string> = {
  newest: '',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  mileage: 'mileage_desc',
  year: 'year_desc'
};

@Injectable({ providedIn: 'root' })
export class CarsFilterService {
  private readonly http = inject(HttpClient);
  private readonly catalog = inject(CatalogService);

  /** Full car list (only populated once the catalogue itself is loaded). */
  readonly cars: Signal<Car[]> = this.catalog.cars as unknown as Signal<Car[]>;

  // ---- server-side paginated listing state --------------------------------
  readonly pageSize = 20;
  readonly page = signal(1);
  readonly gridView = signal<'grid' | 'list'>('grid');
  readonly filters = signal<CarFilters>({ ...DEFAULT_FILTERS });
  readonly query = signal<CarQuery>({ keyword: '', sort: 'newest' });
  readonly items = signal<Car[]>([]);
  readonly totalCount = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // ---- facets (distinct filter options from the server) -------------------
  private readonly facetsSource = signal<VehicleFacets>({ ...EMPTY_FACETS });
  readonly brands = computed(() => [...this.facetsSource().brands].sort());
  readonly years = computed(() =>
    [...this.facetsSource().years].sort((a, b) => b - a)
  );
  readonly fuels = computed(() => this.facetsSource().fuels);
  readonly transmissions = computed(() => this.facetsSource().transmissions);
  readonly owners = computed(() => [...this.facetsSource().owners].sort());
  readonly bodyTypes = computed(() => this.facetsSource().bodyTypes);
  readonly districts = computed(() =>
    [...this.facetsSource().districts].sort()
  );
  readonly colors = computed(() => this.facetsSource().colors);
  readonly priceMinBound = computed(() => this.facetsSource().priceMin);
  readonly priceMaxBound = computed(() => this.facetsSource().priceMax);

  // ---- derived list state --------------------------------------------------
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pageSize))
  );
  readonly pagedCars = this.items;
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
      (f.mileageMax < MILEAGE_MAX ? 1 : 0) +
      f.districts.length +
      f.colors.length +
      (this.query().keyword ? 1 : 0)
    );
  });

  readonly isFiltered = computed(() => this.activeFilterCount() > 0);

  // ---- fetch coordination --------------------------------------------------
  private requestSeq = 0;
  private keywordTimer: ReturnType<typeof setTimeout> | undefined;

  refresh(): void {
    this.requestSeq++;
    this.fetchPage();
    this.loadFacets();
  }

  constructor() {
    this.loadFacets();
    effect(() => {
      void this.filters();
      void this.query();
      void this.page();
      void this.fetchPage();
    });
  }

  private loadFacets(): void {
    this.http
      .get<VehicleFacets>(`${API_BASE}/facets?type=car`)
      .subscribe({
        next: (f) => this.facetsSource.set(f),
        error: () => undefined
      });
  }

  private async fetchPage(): Promise<void> {
    const seq = ++this.requestSeq;
    const params = this.buildParams();
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<{ items: CatalogVehicle[]; total?: number }>(
          `${API_BASE}/vehicles?${params}`
        )
      );
      if (seq !== this.requestSeq) return;
      this.items.set((res?.items ?? []) as unknown as Car[]);
      this.totalCount.set(res?.total ?? 0);
    } catch (err) {
      if (seq !== this.requestSeq) return;
      this.error.set(err instanceof Error ? err.message : 'Failed to load vehicles');
      this.items.set([]);
    } finally {
      if (seq === this.requestSeq) this.loading.set(false);
    }
  }

  private buildParams(): string {
    const f = this.filters();
    const q = this.query();
    const p = new URLSearchParams();
    p.set('type', 'car');
    p.set('page', String(this.page()));
    p.set('limit', String(this.pageSize));

    for (const b of f.brands) p.append('brand', b);
    for (const y of f.years) p.append('year', String(y));
    for (const x of f.fuels) p.append('fuel', x);
    for (const x of f.transmissions) p.append('transmission', x);
    for (const o of f.owners) p.append('owners', String(o));
    for (const x of f.bodyTypes) p.append('bodyType', x);
    for (const x of f.districts) p.append('district', x);
    for (const x of f.colors) p.append('color', x);

    if (f.priceMin > PRICE_MIN) p.set('minPrice', String(f.priceMin));
    if (f.priceMax < PRICE_MAX) p.set('maxPrice', String(f.priceMax));
    if (f.mileageMax < MILEAGE_MAX) p.set('mileageMax', String(f.mileageMax));

    const kw = q.keyword.trim();
    if (kw) p.set('q', kw);
    const sort = SORT_MAP[q.sort];
    if (sort) p.set('sortBy', sort);
    return p.toString();
  }

  // ---- actions -------------------------------------------------------------
  updateFilters(partial: Partial<CarFilters>): void {
    this.filters.update((f) => ({ ...f, ...partial }));
    this.page.set(1);
  }

  setKeyword(keyword: string): void {
    clearTimeout(this.keywordTimer);
    this.keywordTimer = setTimeout(() => {
      this.query.update((q) => ({ ...q, keyword }));
      this.page.set(1);
    }, 300);
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

  resetFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
    this.page.set(1);
  }

  resetAll(): void {
    this.resetFilters();
    this.query.set({ keyword: '', sort: 'newest' });
  }
}