import { Component, inject } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { BikesFilterService } from '../../services/bikes-filter.service';

interface ActiveChip {
  label: string;
  remove: () => void;
}

@Component({
  selector: 'app-bike-active-filters',
  standalone: true,
  imports: [LucideX],
  templateUrl: './active-filters.component.html',
  styleUrl: './active-filters.component.scss'
})
export class BikeActiveFiltersComponent {
  private readonly service = inject(BikesFilterService);

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
    f.models.forEach((m) =>
      chips.push({
        label: m,
        remove: () => this.service.updateFilters({ models: removeOne(f.models, m) })
      })
    );
    f.absOptions.forEach((o) =>
      chips.push({
        label: o,
        remove: () => this.service.updateFilters({ absOptions: removeOne(f.absOptions, o) })
      })
    );
    f.fuels.forEach((x) =>
      chips.push({
        label: x,
        remove: () => this.service.updateFilters({ fuels: removeOne(f.fuels, x) })
      })
    );
    f.owners.forEach((o) =>
      chips.push({
        label: o === 1 ? '1st Owner' : `${o} Owners`,
        remove: () => this.service.updateFilters({ owners: removeOne(f.owners, o) })
      })
    );
    if (f.ccMin > this.service.ccMinBound || f.ccMax < this.service.ccMaxBound) {
      chips.push({
        label: `${f.ccMin}–${f.ccMax} cc`,
        remove: () =>
          this.service.updateFilters({
            ccMin: this.service.ccMinBound,
            ccMax: this.service.ccMaxBound
          })
      });
    }
    if (f.mileageMax < this.service.mileageBound) {
      chips.push({
        label: `≤ ${f.mileageMax} km/l`,
        remove: () => this.service.updateFilters({ mileageMax: this.service.mileageBound })
      });
    }
    return chips;
  }

  clearAll(): void {
    this.service.resetFilters();
  }
}
