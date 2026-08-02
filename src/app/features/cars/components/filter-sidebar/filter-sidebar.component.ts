import { Component, inject, input } from '@angular/core';
import { LucideRotateCcw, LucideCheck } from '@lucide/angular';
import { CarsFilterService } from '../../services/cars-filter.service';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [LucideRotateCcw, LucideCheck],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss'
})
export class FilterSidebarComponent {
  /** When true, renders inside the mobile drawer (no sticky positioning). */
  readonly embedded = input(false);

  private readonly service = inject(CarsFilterService);

  readonly filters = this.service.filters;
  readonly activeFilterCount = this.service.activeFilterCount;

  readonly brands = this.service.brands;
  readonly years = this.service.years;
  readonly fuels = this.service.fuels;
  readonly transmissions = this.service.transmissions;
  readonly owners = this.service.owners;
  readonly bodyTypes = this.service.bodyTypes;
  readonly districts = this.service.districts;
  readonly colors = this.service.colors;
  readonly priceMinBound = this.service.priceMinBound;
  readonly priceMaxBound = this.service.priceMaxBound;

  readonly openSections = new Set<string>(['brand', 'price', 'year', 'fuel']);

  toggleSection(key: string): void {
    if (this.openSections.has(key)) {
      this.openSections.delete(key);
    } else {
      this.openSections.add(key);
    }
  }

  isOpen(key: string): boolean {
    return this.openSections.has(key);
  }

  toggleBrand(brand: string): void {
    this.service.updateFilters({ brands: this.toggleValue(this.filters().brands, brand) });
  }

  toggleYear(year: number): void {
    this.service.updateFilters({ years: this.toggleValue(this.filters().years, year) });
  }

  toggleFuel(fuel: string): void {
    this.service.updateFilters({ fuels: this.toggleValue(this.filters().fuels, fuel) });
  }

  toggleTransmission(t: string): void {
    this.service.updateFilters({ transmissions: this.toggleValue(this.filters().transmissions, t) });
  }

  toggleOwner(o: number): void {
    this.service.updateFilters({ owners: this.toggleValue(this.filters().owners, o) });
  }

  toggleBodyType(bt: string): void {
    this.service.updateFilters({ bodyTypes: this.toggleValue(this.filters().bodyTypes, bt) });
  }

  toggleDistrict(d: string): void {
    this.service.updateFilters({ districts: this.toggleValue(this.filters().districts, d) });
  }

  toggleColor(c: string): void {
    this.service.updateFilters({ colors: this.toggleValue(this.filters().colors, c) });
  }

  setPriceMin(v: string): void {
    const n = Math.min(Number(v), this.filters().priceMax);
    this.service.updateFilters({ priceMin: n });
  }

  setPriceMax(v: string): void {
    const n = Math.max(Number(v), this.filters().priceMin);
    this.service.updateFilters({ priceMax: n });
  }

  setMileageMax(v: string): void {
    this.service.updateFilters({ mileageMax: Number(v) });
  }

  resetFilters(): void {
    this.service.resetFilters();
  }

  private toggleValue<T>(list: T[], value: T): T[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }
}
