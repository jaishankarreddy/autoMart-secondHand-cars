import { Component, inject } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { CarsFilterService } from '../../services/cars-filter.service';

interface ActiveChip {
  label: string;
  remove: () => void;
}

@Component({
  selector: 'app-active-filters',
  standalone: true,
  imports: [LucideX],
  templateUrl: './active-filters.component.html',
  styleUrl: './active-filters.component.scss'
})
export class ActiveFiltersComponent {
  private readonly service = inject(CarsFilterService);

  readonly isFiltered = this.service.isFiltered;
  readonly activeCount = this.service.activeFilterCount;
  readonly chips = this.service.filters;

  buildChips(): ActiveChip[] {
    const f = this.chips();
    const chips: ActiveChip[] = [];
    const removeOne = <T>(arr: T[], value: T) => arr.filter((v) => v !== value);

    f.brands.forEach((b) =>
      chips.push({
        label: b,
        remove: () => this.service.updateFilters({ brands: removeOne(f.brands, b) })
      })
    );
    f.fuels.forEach((x) =>
      chips.push({
        label: x,
        remove: () => this.service.updateFilters({ fuels: removeOne(f.fuels, x) })
      })
    );
    f.transmissions.forEach((x) =>
      chips.push({
        label: x,
        remove: () => this.service.updateFilters({ transmissions: removeOne(f.transmissions, x) })
      })
    );
    f.bodyTypes.forEach((x) =>
      chips.push({
        label: x,
        remove: () => this.service.updateFilters({ bodyTypes: removeOne(f.bodyTypes, x) })
      })
    );
    f.districts.forEach((x) =>
      chips.push({
        label: x,
        remove: () => this.service.updateFilters({ districts: removeOne(f.districts, x) })
      })
    );
    f.colors.forEach((x) =>
      chips.push({
        label: x,
        remove: () => this.service.updateFilters({ colors: removeOne(f.colors, x) })
      })
    );
    f.years.forEach((y) =>
      chips.push({
        label: `${y}`,
        remove: () => this.service.updateFilters({ years: removeOne(f.years, y) })
      })
    );
    f.owners.forEach((o) =>
      chips.push({
        label: o === 1 ? '1st Owner' : `${o} Owners`,
        remove: () => this.service.updateFilters({ owners: removeOne(f.owners, o) })
      })
    );
    if (f.priceMin > this.service.priceMinBound() || f.priceMax < this.service.priceMaxBound()) {
      chips.push({
        label: `₹${f.priceMin}L – ₹${f.priceMax}L`,
        remove: () =>
          this.service.updateFilters({
            priceMin: this.service.priceMinBound(),
            priceMax: this.service.priceMaxBound()
          })
      });
    }
    if (f.mileageMax < 24) {
      chips.push({
        label: `≤ ${f.mileageMax} km/l`,
        remove: () => this.service.updateFilters({ mileageMax: 24 })
      });
    }
    return chips;
  }

  clearAll(): void {
    this.service.resetFilters();
  }
}
