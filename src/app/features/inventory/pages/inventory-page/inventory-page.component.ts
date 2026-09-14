import { Component, DestroyRef, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LucideArrowDownUp,
  LucideArrowRight,
  LucideBike,
  LucideCarFront,
  LucideCheck,
  LucideChevronDown,
  LucideFilter,
  LucideGrid2X2,
  LucideHeart,
  LucideList,
  LucideMapPin,
  LucideSearch,
  LucideShieldCheck,
  LucideSparkles,
  LucideX,
  LucideGauge,
  LucideFuel,
  LucideCalendarDays,
  LucideLoaderCircle
} from '@lucide/angular';
import { WishlistService } from '../../../../services/wishlist.service';
import { CatalogVehicle } from '../../../../services/catalog.service';
import { InventoryFacets, InventoryService } from '../../services/inventory.service';

export type VehicleType = 'Car' | 'Bike';
export type AbsOption = 'all' | 'With ABS' | 'Without ABS';

export interface ListingVehicle {
  id: string;
  type: VehicleType;
  brand: string;
  model: string;
  trim: string;
  price: number;
  location: string;
  year: number;
  km: string;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  owners: number;
  mileage: number;
  engineCc?: number;
  abs?: boolean;
  image: string;
  featured?: boolean;
  rating: string;
}

interface ActiveFilterPill {
  id: string;
  label: string;
}

const PAGE_SIZE = 15;

@Component({
  selector: 'app-inventory-page',
  standalone: true,
  imports: [
    RouterLink,
    LucideArrowDownUp,
    LucideArrowRight,
    LucideBike,
    LucideCarFront,
    LucideCheck,
    LucideChevronDown,
    LucideFilter,
    LucideGrid2X2,
    LucideHeart,
    LucideList,
    LucideMapPin,
    LucideSearch,
    LucideShieldCheck,
    LucideSparkles,
    LucideX,
    LucideGauge,
    LucideFuel,
    LucideCalendarDays,
    LucideLoaderCircle
  ],
  templateUrl: './inventory-page.component.html',
  styleUrl: './inventory-page.component.scss'
})
export class InventoryPageComponent {
  private readonly inventory = inject(InventoryService);
  private readonly wishlistService = inject(WishlistService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly type = signal<VehicleType>(this.route.snapshot.data['type'] === 'bike' ? 'Bike' : 'Car');
  readonly sort = signal('Newest first');
  readonly search = signal('');
  readonly filtersOpen = signal(false);
  readonly view = signal<'grid' | 'list'>('grid');

  // ---- filter state -------------------------------------------------------
  readonly selectedBrands = signal<string[]>([]);
  readonly selectedModels = signal<string[]>([]);
  readonly selectedYears = signal<number[]>([]);
  readonly selectedFuels = signal<string[]>([]);
  readonly selectedTransmissions = signal<string[]>([]);
  readonly selectedBodyTypes = signal<string[]>([]);
  readonly selectedLocations = signal<string[]>([]);
  readonly selectedColors = signal<string[]>([]);
  readonly selectedOwners = signal<number[]>([]);
  readonly absOption = signal<AbsOption>('all');
  readonly priceMin = signal(0);
  readonly priceMax = signal(2500000);
  readonly priceBucket = signal('');
  readonly kmBucket = signal('');
  readonly ccMin = signal(100);
  readonly ccMax = signal(650);
  readonly mileageMax = signal(60);

  /** Debounced copy of `search` so typing does not hammer the API. */
  readonly debouncedSearch = signal('');

  // ---- server state -------------------------------------------------------
  private readonly carFacets = signal<InventoryFacets | null>(null);
  private readonly bikeFacets = signal<InventoryFacets | null>(null);
  readonly results = signal<ListingVehicle[]>([]);
  readonly total = signal(0);
  readonly page = signal(0);
  readonly hasMore = signal(false);
  readonly loadingResults = signal(false);
  readonly loadingMore = signal(false);
  readonly loadError = signal<string | null>(null);

  private pendingBudget: string | null = null;
  readonly appliedBudget = signal<string | null>(null);
  private searchTimer: ReturnType<typeof setTimeout> | undefined;
  private requestSeq = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.route.url.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => this.syncFromRoute());
    this.loadFacets('car');
    this.loadFacets('bike');
    this.syncFromRoute();

    effect(() => {
      void this.queryKey();
      const facets = this.facets();
      if (!facets || facets.type !== (this.type() === 'Bike' ? 'bike' : 'car')) return;
      void this.fetchResults(true);
    });
  }

  // ---- facets helpers -----------------------------------------------------
  readonly facets = computed(() =>
    this.type() === 'Bike' ? this.bikeFacets() : this.carFacets()
  );
  readonly carCount = computed(() => this.carFacets()?.count ?? 0);
  readonly bikeCount = computed(() => this.bikeFacets()?.count ?? 0);

  readonly maxPriceOfType = computed(() => this.facets()?.priceMax ?? 0);
  readonly maxCcOfType = computed(() => this.facets()?.engineCcMax ?? 650);
  readonly maxMileageOfType = computed(() => this.facets()?.mileageMax ?? 60);

  readonly brands = computed(() => [...(this.facets()?.brands ?? [])].sort());
  readonly models = computed(() => [...(this.facets()?.models ?? [])].sort());
  readonly years = computed(() => [...(this.facets()?.years ?? [])].sort((a, b) => b - a));
  readonly fuels = computed(() => [...(this.facets()?.fuels ?? [])].sort());
  readonly transmissions = computed(() => [...(this.facets()?.transmissions ?? [])].sort());
  readonly bodyTypes = computed(() => [...(this.facets()?.bodyTypes ?? [])].sort());
  readonly locations = computed(() => [...(this.facets()?.districts ?? [])].sort());
  readonly colors = computed(() => [...(this.facets()?.colors ?? [])].sort());
  readonly ownerOptions = computed(() => [...(this.facets()?.owners ?? [])].sort((a, b) => a - b));

  readonly activeFilterPills = computed<ActiveFilterPill[]>(() => {
    const pills: ActiveFilterPill[] = [];
    const addValues = (prefix: string, values: readonly (string | number)[]) => {
      for (const value of values) pills.push({ id: `${prefix}:${value}`, label: String(value) });
    };

    addValues('brand', this.selectedBrands());
    addValues('model', this.selectedModels());
    addValues('year', this.selectedYears());
    addValues('fuel', this.selectedFuels());
    addValues('transmission', this.selectedTransmissions());
    addValues('bodyType', this.selectedBodyTypes());
    addValues('district', this.selectedLocations());
    addValues('color', this.selectedColors());
    addValues('owners', this.selectedOwners().map((owner) => `${owner} owner${owner > 1 ? 's' : ''}`));

    if (this.absOption() !== 'all') pills.push({ id: 'abs', label: this.absOption() });
    if (this.appliedBudget()) {
      pills.push({ id: 'budget', label: this.budgetPillLabel(this.appliedBudget()!) });
    } else {
      if (this.priceMin() > 0) pills.push({ id: 'price-min', label: `From ₹${this.priceMin().toLocaleString('en-IN')}` });
      if (this.priceMax() < this.maxPriceOfType()) pills.push({ id: 'price-max', label: `Up to ₹${this.priceMax().toLocaleString('en-IN')}` });
    }
    if (this.priceBucket()) {
      const bucket = this.priceBuckets().find((option) => option.value === this.priceBucket());
      pills.push({ id: 'price-bucket', label: bucket?.label ?? 'Price' });
    }
    if (this.kmBucket()) {
      const bucket = this.kmBuckets().find((option) => option.value === this.kmBucket());
      pills.push({ id: 'km-bucket', label: bucket?.label ?? 'Kilometres' });
    }
    if (this.type() === 'Bike' && this.ccMin() > 100) pills.push({ id: 'cc-min', label: `Min ${this.ccMin()} CC` });
    if (this.type() === 'Bike' && this.ccMax() < this.maxCcOfType()) pills.push({ id: 'cc-max', label: `Max ${this.ccMax()} CC` });
    if (this.mileageMax() < this.maxMileageOfType()) pills.push({ id: 'mileage', label: `Up to ${this.mileageMax()} km/l` });
    if (this.debouncedSearch().trim()) pills.push({ id: 'search', label: `Search: ${this.debouncedSearch().trim()}` });

    return pills;
  });

  readonly priceBuckets = computed(() =>
    (this.facets()?.priceBuckets ?? []).map((b) =>
      b.threshold === null
        ? { value: 'above', label: 'Above ₹3,00,000', count: b.count }
        : { value: String(b.threshold), label: `Under ₹${b.threshold.toLocaleString('en-IN')}`, count: b.count }
    )
  );

  readonly kmBuckets = computed(() =>
    (this.facets()?.kmBuckets ?? []).map((b) => ({
      value: String(b.threshold),
      label: `Less than ${b.threshold.toLocaleString('en-IN')} km`,
      count: b.count
    }))
  );

  // ---- query construction -------------------------------------------------
  readonly queryKey = computed(() => {
    const type = this.type();
    return [
      type,
      this.sort(),
      this.debouncedSearch().trim(),
      this.selectedBrands().join(','),
      this.selectedModels().join(','),
      this.selectedYears().join(','),
      this.selectedFuels().join(','),
      this.selectedTransmissions().join(','),
      this.selectedBodyTypes().join(','),
      this.selectedLocations().join(','),
      this.selectedColors().join(','),
      this.selectedOwners().join(','),
      this.absOption(),
      `${this.priceMin()}-${this.priceMax()}`,
      this.priceBucket(),
      this.kmBucket(),
      type === 'Bike' ? `${this.ccMin()}-${this.ccMax()}` : '',
      String(this.mileageMax())
    ].join('|');
  });

  private buildParams(page: number): URLSearchParams {
    const p = new URLSearchParams();
    p.set('type', this.type() === 'Bike' ? 'bike' : 'car');
    p.set('page', String(page));
    p.set('limit', String(PAGE_SIZE));

    for (const b of this.selectedBrands()) p.append('brand', b);
    for (const m of this.selectedModels()) p.append('model', m);
    for (const y of this.selectedYears()) p.append('year', String(y));
    for (const f of this.selectedFuels()) p.append('fuel', f);
    for (const t of this.selectedTransmissions()) p.append('transmission', t);
    for (const b of this.selectedBodyTypes()) p.append('bodyType', b);
    for (const d of this.selectedLocations()) p.append('district', d);
    for (const c of this.selectedColors()) p.append('color', c);
    for (const o of this.selectedOwners()) p.append('owners', String(o));

    const abs = this.absOption();
    if (abs === 'With ABS') p.set('abs', 'true');
    else if (abs === 'Without ABS') p.set('abs', 'false');

    if (this.priceMin() > 0) p.set('minPrice', String(this.priceMin()));
    if (this.priceMax() < this.maxPriceOfType()) p.set('maxPrice', String(this.priceMax()));

    if (this.type() === 'Bike') {
      if (this.ccMin() > 100) p.set('engineCcMin', String(this.ccMin()));
      if (this.ccMax() < this.maxCcOfType()) p.set('engineCcMax', String(this.ccMax()));
      const bucket = this.priceBucket();
      if (bucket === 'above') p.set('minPrice', '300000');
      else if (bucket) p.set('maxPrice', bucket);
      if (this.kmBucket()) p.set('maxKm', this.kmBucket());
    }

    if (this.mileageMax() < this.maxMileageOfType()) p.set('mileageMax', String(this.mileageMax()));

    const kw = this.debouncedSearch().trim();
    if (kw) p.set('q', kw);
    const sort = this.sortToApi(this.sort());
    if (sort) p.set('sortBy', sort);
    return p;
  }

  private sortToApi(sort: string): string {
    switch (sort) {
      case 'Price: low to high': return 'price_asc';
      case 'Price: high to low': return 'price_desc';
      default: return 'newest';
    }
  }

  // ---- fetching -----------------------------------------------------------
  private async fetchResults(reset: boolean): Promise<void> {
    const seq = ++this.requestSeq;
    const nextPage = reset ? 1 : this.page() + 1;
    const params = this.buildParams(nextPage);

    if (reset) this.loadingResults.set(true);
    else this.loadingMore.set(true);
    this.loadError.set(null);

    try {
      const res = await this.inventory.fetchVehicles(params);
      if (seq !== this.requestSeq) return;
      const mapped = res.items.map((v) => this.toListing(v));
      if (reset) {
        this.results.set(mapped);
        this.page.set(1);
      } else {
        this.results.update((cur) => [...cur, ...mapped]);
        this.page.set(nextPage);
      }
      this.total.set(res.total);
      this.hasMore.set(res.page < res.totalPages);
    } catch (err) {
      if (seq !== this.requestSeq) return;
      this.loadError.set(err instanceof Error ? err.message : 'Failed to load vehicles');
      if (reset) this.results.set([]);
    } finally {
      if (seq === this.requestSeq) {
        this.loadingResults.set(false);
        this.loadingMore.set(false);
      }
    }
  }

  loadMore(): void {
    if (this.loadingMore() || !this.hasMore()) return;
    void this.fetchResults(false);
  }

  private toListing(v: CatalogVehicle): ListingVehicle {
    return {
      id: v.id,
      type: v.vehicleType === 'bike' ? 'Bike' : 'Car',
      brand: v.brand,
      model: v.model,
      trim: v.variant,
      price: Number.isFinite(Number(v.price)) ? Number(v.price) : 0,
      location: v.district || v.location || 'Karnataka',
      year: v.year,
      km: `${(v.kilometers ?? 0).toLocaleString('en-IN')} km`,
      fuel: v.fuel,
      transmission: v.transmission,
      bodyType: v.bodyType,
      color: v.color,
      owners: v.owners,
      mileage: v.mileage,
      engineCc: v.engineCC,
      abs: v.abs,
      image: v.image,
      featured: v.featured,
      rating: v.rating ? v.rating.toFixed(1) : '4.5'
    };
  }

  // ---- route / defaults ---------------------------------------------------
  private syncFromRoute(): void {
    const snapshot = this.route.snapshot;
    const dataType = snapshot.data['type'];
    const qp = snapshot.queryParamMap;
    const qType = qp.get('type');
    const type: VehicleType =
      qType === 'bike' ? 'Bike' : qType === 'car' ? 'Car' : dataType === 'bike' ? 'Bike' : 'Car';
    this.type.set(type);

    this.selectedModels.set([]);
    this.selectedYears.set([]);
    this.selectedFuels.set([]);
    this.selectedTransmissions.set([]);
    this.selectedBodyTypes.set([]);
    this.selectedLocations.set([]);
    this.selectedColors.set([]);
    this.selectedOwners.set([]);
    this.absOption.set('all');
    this.search.set('');
    this.debouncedSearch.set('');

    const brand = qp.get('brand');
    this.selectedBrands.set(brand ? [brand] : []);
    this.pendingBudget = qp.get('budget');
    this.appliedBudget.set(this.pendingBudget);
    this.applyTypeDefaults();
    // Facets may not be loaded on first visit; loadFacets() applies the budget
    // once they arrive. If they are already cached, apply it right away.
    if (this.facets()) this.applyBudget();
  }

  private loadFacets(type: 'car' | 'bike'): void {
    this.inventory.fetchFacets(type).then((f) => {
      if (type === 'bike') this.bikeFacets.set(f);
      else this.carFacets.set(f);
      if ((type === 'bike' && this.type() === 'Bike') || (type === 'car' && this.type() === 'Car')) {
        this.applyTypeDefaults();
        this.applyBudget();
      }
    });
  }

  private applyBudget(): void {
    if (!this.pendingBudget) return;
    const range = this.budgetToRange(this.pendingBudget);
    this.priceMin.set(range.min);
    this.priceMax.set(range.max);
    this.priceBucket.set('');
    this.pendingBudget = null;
  }

  private budgetPillLabel(range: string): string {
    const labels: Record<string, string> = {
      '0-5': 'Under ₹5,00,000',
      '5-10': '₹5,00,000 - ₹10,00,000',
      '10-15': '₹10,00,000 - ₹15,00,000',
      '15-25': '₹15,00,000 - ₹25,00,000',
      '25+': '₹25,00,000+'
    };
    return labels[range] ?? 'Budget';
  }

  private budgetToRange(range: string): { min: number; max: number } {
    const catalogueMax = this.maxPriceOfType();
    switch (range) {
      case '0-5': return { min: 0, max: 500000 };
      case '5-10': return { min: 500000, max: 1000000 };
      case '10-15': return { min: 1000000, max: 1500000 };
      case '15-25': return { min: 1500000, max: 2500000 };
      case '25+': return { min: 2500000, max: catalogueMax };
      default: return { min: 0, max: catalogueMax };
    }
  }

  private applyTypeDefaults(): void {
    const facets = this.facets();
    this.priceMin.set(0);
    this.priceMax.set(facets?.priceMax ?? 2500000);
    this.priceBucket.set('');
    this.kmBucket.set('');
    this.ccMin.set(100);
    this.ccMax.set(facets?.engineCcMax ?? 650);
    this.mileageMax.set(facets?.mileageMax ?? 60);
  }

  // ---- filtering ----------------------------------------------------------
  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.selectedBrands().length) count += this.selectedBrands().length;
    if (this.selectedModels().length) count += this.selectedModels().length;
    if (this.selectedYears().length) count += this.selectedYears().length;
    if (this.selectedFuels().length) count += this.selectedFuels().length;
    if (this.selectedTransmissions().length) count += this.selectedTransmissions().length;
    if (this.selectedBodyTypes().length) count += this.selectedBodyTypes().length;
    if (this.selectedLocations().length) count += this.selectedLocations().length;
    if (this.selectedColors().length) count += this.selectedColors().length;
    if (this.selectedOwners().length) count += this.selectedOwners().length;
    if (this.absOption() !== 'all') count += 1;
    if (this.priceMin() > 0 || this.priceMax() < this.maxPriceOfType()) count += 1;
    if (this.type() === 'Bike' && this.priceBucket()) count += 1;
    if (this.type() === 'Bike' && this.kmBucket()) count += 1;
    if (this.type() === 'Bike' && (this.ccMin() > 100 || this.ccMax() < this.maxCcOfType())) count += 1;
    if (this.mileageMax() < this.maxMileageOfType()) count += 1;
    if (this.debouncedSearch().trim()) count += 1;
    return count;
  });

  readonly hasActiveFilters = computed(() => this.activeFilterCount() > 0);

  // ---- actions ------------------------------------------------------------
  changeType(nextType: VehicleType): void {
    if (nextType === this.type()) return;
    const queryParams: Record<string, string> = { type: nextType === 'Bike' ? 'bike' : 'car' };
    const qp = this.route.snapshot.queryParamMap;
    const brand = qp.get('brand');
    const budget = qp.get('budget');
    if (brand) queryParams['brand'] = brand;
    if (budget) queryParams['budget'] = budget;
    this.router.navigate([`/${nextType === 'Bike' ? 'bikes' : 'cars'}`], { queryParams });
  }

  toggleIn<T>(sig: WritableSignal<T[]>, value: T): void {
    sig.update((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  toggleBrand(brand: string): void { this.toggleIn(this.selectedBrands, brand); }
  toggleModel(model: string): void { this.toggleIn(this.selectedModels, model); }
  toggleYear(year: number): void { this.toggleIn(this.selectedYears, year); }
  toggleFuel(fuel: string): void { this.toggleIn(this.selectedFuels, fuel); }
  toggleTransmission(transmission: string): void { this.toggleIn(this.selectedTransmissions, transmission); }
  toggleBodyType(bodyType: string): void { this.toggleIn(this.selectedBodyTypes, bodyType); }
  toggleLocation(location: string): void { this.toggleIn(this.selectedLocations, location); }
  toggleColor(color: string): void { this.toggleIn(this.selectedColors, color); }
  toggleOwner(owner: number): void { this.toggleIn(this.selectedOwners, owner); }

  isSelected(sig: WritableSignal<unknown[]>, value: unknown): boolean {
    return (sig() as unknown[]).includes(value);
  }

  setAbsOption(option: string): void {
    this.absOption.set(option as AbsOption);
  }

  setPriceBucket(value: string): void {
    this.priceBucket.set(this.priceBucket() === value ? '' : value);
  }

  setKmBucket(value: string): void {
    this.kmBucket.set(this.kmBucket() === value ? '' : value);
  }

  toggleSave(id: string): void {
    this.wishlistService.toggle(id);
  }

  isSaved = (id: string): boolean => this.wishlistService.has(id);

  setSearchValue(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.debouncedSearch.set(value), 300);
  }

  setSortValue(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value);
  }

  setPriceValue(event: Event): void {
    this.priceMax.set(Number((event.target as HTMLInputElement).value));
  }

  setCcMinValue(event: Event): void {
    this.ccMin.set(Number((event.target as HTMLInputElement).value));
  }

  setCcMaxValue(event: Event): void {
    this.ccMax.set(Number((event.target as HTMLInputElement).value));
  }

  setMileageValue(event: Event): void {
    this.mileageMax.set(Number((event.target as HTMLInputElement).value));
  }

  removeActiveFilter(id: string): void {
    const [prefix, ...valueParts] = id.split(':');
    const value = valueParts.join(':');

    switch (prefix) {
      case 'brand': this.selectedBrands.update((items) => items.filter((item) => item !== value)); break;
      case 'model': this.selectedModels.update((items) => items.filter((item) => item !== value)); break;
      case 'year': this.selectedYears.update((items) => items.filter((item) => String(item) !== value)); break;
      case 'fuel': this.selectedFuels.update((items) => items.filter((item) => item !== value)); break;
      case 'transmission': this.selectedTransmissions.update((items) => items.filter((item) => item !== value)); break;
      case 'bodyType': this.selectedBodyTypes.update((items) => items.filter((item) => item !== value)); break;
      case 'district': this.selectedLocations.update((items) => items.filter((item) => item !== value)); break;
      case 'color': this.selectedColors.update((items) => items.filter((item) => item !== value)); break;
      case 'owners': this.selectedOwners.update((items) => items.filter((item) => `${item} owner${item > 1 ? 's' : ''}` !== value)); break;
      case 'abs': this.absOption.set('all'); break;
      case 'budget': this.appliedBudget.set(null); this.priceMin.set(0); this.priceMax.set(this.maxPriceOfType()); this.priceBucket.set(''); break;
      case 'price-min': this.priceMin.set(0); break;
      case 'price-max': this.priceMax.set(this.maxPriceOfType()); break;
      case 'price-bucket': this.priceBucket.set(''); break;
      case 'km-bucket': this.kmBucket.set(''); break;
      case 'cc-min': this.ccMin.set(100); break;
      case 'cc-max': this.ccMax.set(this.maxCcOfType()); break;
      case 'mileage': this.mileageMax.set(this.maxMileageOfType()); break;
      case 'search': this.search.set(''); this.debouncedSearch.set(''); break;
    }
  }

  resetFilters(): void {
    this.selectedBrands.set([]);
    this.selectedModels.set([]);
    this.selectedYears.set([]);
    this.selectedFuels.set([]);
    this.selectedTransmissions.set([]);
    this.selectedBodyTypes.set([]);
    this.selectedLocations.set([]);
    this.selectedColors.set([]);
    this.selectedOwners.set([]);
    this.absOption.set('all');
    this.appliedBudget.set(null);
    this.search.set('');
    this.debouncedSearch.set('');
    this.applyTypeDefaults();
  }

  clearFilters(): void {
    this.resetFilters();
  }
}