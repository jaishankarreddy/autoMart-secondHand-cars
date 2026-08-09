import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Bike } from '../models/bike.model';
import { CatalogService, CatalogVehicle } from '../../../services/catalog.service';

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

const ENGINE_CC_MIN = 100;
const ENGINE_CC_MAX = 650;
const BIKE_MILEAGE_MAX = 60;

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

interface BikeFacets {
  brands: string[];
  models: string[];
  fuels: string[];
  owners: number[];
}

const EMPTY_FACETS: BikeFacets = { brands: [], models: [], fuels: [], owners: [] };

const SORT_MAP: Record<BikeSortKey, string> = {
  newest: '',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  mileage: 'mileage_desc',
  year: 'year_desc'
};

const API_URL = '/api';

@Injectable({ providedIn: 'root' })
export class BikesFilterService {
  private readonly http = inject(HttpClient);
  private readonly catalog = inject(CatalogService);

  /** Full bike list (only populated once the catalogue itself is loaded). */
  readonly bikes: Signal<Bike[]> = this.catalog.bikes as unknown as Signal<Bike[]>;

  // ---- server-side paginated listing state --------------------------------
  readonly pageSize = 20;
  readonly page = signal(1);
  readonly gridView = signal<'grid' | 'list'>('grid');
  readonly filters = signal<BikeFilters>({ ...DEFAULT_FILTERS });
  readonly query = signal<BikeQuery>({ keyword: '', sort: 'newest' });
  readonly items = signal<Bike[]>([]);
  readonly totalCount = signal(0);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // ---- facets (distinct filter options from the server) -------------------
  private readonly facetsSource = signal<BikeFacets>({ ...EMPTY_FACETS });
  readonly brands = computed(() => [...this.facetsSource().brands].sort());
  readonly models = computed(() => [...this.facetsSource().models].sort());
  readonly fuels = computed(() => this.facetsSource().fuels);
  readonly owners = computed(() => [...this.facetsSource().owners].sort());
  readonly ccMinBound = ENGINE_CC_MIN;
  readonly ccMaxBound = ENGINE_CC_MAX;
  readonly mileageBound = BIKE_MILEAGE_MAX;

  // ---- derived list state --------------------------------------------------
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / this.pageSize))
  );
  readonly pagedBikes = this.items;
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
      f.models.length +
      (f.ccMin > ENGINE_CC_MIN || f.ccMax < ENGINE_CC_MAX ? 1 : 0) +
      f.absOptions.length +
      (f.mileageMax < BIKE_MILEAGE_MAX ? 1 : 0) +
      f.fuels.length +
      f.owners.length +
      (this.query().keyword ? 1 : 0)
    );
  });

  readonly isFiltered = computed(() => this.activeFilterCount() > 0);

  readonly wishlist = signal<Set<string>>(new Set());

  // ---- fetch coordination --------------------------------------------------
  private requestSeq = 0;
  private keywordTimer: ReturnType<typeof setTimeout> | undefined;

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
      .get<BikeFacets>(`${API_URL}/facets?type=bike`)
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
          `${API_URL}/vehicles?${params}`
        )
      );
      if (seq !== this.requestSeq) return;
      this.items.set((res?.items ?? []) as unknown as Bike[]);
      this.totalCount.set(res?.total ?? 0);
    } catch (err) {
      if (seq !== this.requestSeq) return;
      this.error.set(err instanceof Error ? err.message : 'Failed to load bikes');
      this.items.set([]);
    } finally {
      if (seq === this.requestSeq) this.loading.set(false);
    }
  }

  private buildParams(): string {
    const f = this.filters();
    const q = this.query();
    const p = new URLSearchParams();
    p.set('type', 'bike');
    p.set('page', String(this.page()));
    p.set('limit', String(this.pageSize));

    for (const b of f.brands) p.append('brand', b);
    for (const m of f.models) p.append('model', m);
    for (const x of f.fuels) p.append('fuel', x);
    for (const o of f.owners) p.append('owners', String(o));
    if (f.ccMin > ENGINE_CC_MIN) p.set('engineCcMin', String(f.ccMin));
    if (f.ccMax < ENGINE_CC_MAX) p.set('engineCcMax', String(f.ccMax));
    if (f.absOptions.length === 1) p.set('abs', f.absOptions[0] === 'With ABS' ? 'true' : 'false');
    if (f.mileageMax < BIKE_MILEAGE_MAX) p.set('mileageMax', String(f.mileageMax));

    const kw = q.keyword.trim();
    if (kw) p.set('q', kw);
    const sort = SORT_MAP[q.sort];
    if (sort) p.set('sortBy', sort);
    return p.toString();
  }

  // ---- actions -------------------------------------------------------------
  updateFilters(partial: Partial<BikeFilters>): void {
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
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