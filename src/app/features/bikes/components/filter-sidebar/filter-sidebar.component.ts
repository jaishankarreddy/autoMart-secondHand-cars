import { Component, inject, input } from '@angular/core';
import { LucideRotateCcw, LucideCheck } from '@lucide/angular';
import { BikesFilterService } from '../../services/bikes-filter.service';

@Component({
  selector: 'app-bike-filter-sidebar',
  standalone: true,
  imports: [LucideRotateCcw, LucideCheck],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss'
})
export class BikeFilterSidebarComponent {
  /** When true, renders inside the mobile drawer (no sticky positioning). */
  readonly embedded = input(false);

  private readonly service = inject(BikesFilterService);

  readonly filters = this.service.filters;
  readonly activeFilterCount = this.service.activeFilterCount;

  readonly brands = this.service.brands;
  readonly models = this.service.models;
  readonly fuels = this.service.fuels;
  readonly owners = this.service.owners;
  readonly ccMinBound = this.service.ccMinBound;
  readonly ccMaxBound = this.service.ccMaxBound;
  readonly mileageBound = this.service.mileageBound;

  readonly absOptions = ['With ABS', 'Without ABS'];

  readonly openSections = new Set<string>(['brand', 'cc', 'mileage', 'fuel']);

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

  toggleModel(model: string): void {
    this.service.updateFilters({ models: this.toggleValue(this.filters().models, model) });
  }

  toggleAbs(opt: string): void {
    this.service.updateFilters({ absOptions: this.toggleValue(this.filters().absOptions, opt) });
  }

  toggleFuel(fuel: string): void {
    this.service.updateFilters({ fuels: this.toggleValue(this.filters().fuels, fuel) });
  }

  toggleOwner(o: number): void {
    this.service.updateFilters({ owners: this.toggleValue(this.filters().owners, o) });
  }

  setCcMin(v: string): void {
    const n = Math.min(Number(v), this.filters().ccMax);
    this.service.updateFilters({ ccMin: n });
  }

  setCcMax(v: string): void {
    const n = Math.max(Number(v), this.filters().ccMin);
    this.service.updateFilters({ ccMax: n });
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
