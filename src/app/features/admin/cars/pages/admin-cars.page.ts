import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  LucidePlus,
  LucideSearch,
  LucideMapPin,
  LucidePencil,
  LucideTrash2,
  LucideCog,
  LucideFuel,
  LucideGauge
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { CarsFilterService } from '../../../cars/services/cars-filter.service';
import { toAdminVehicle } from '../../utils/vehicle.util';

@Component({
  selector: 'app-admin-cars-page',
  standalone: true,
  imports: [
    DecimalPipe,
    RippleDirective,
    LucidePlus,
    LucideSearch,
    LucideMapPin,
    LucidePencil,
    LucideTrash2,
    LucideCog,
    LucideFuel,
    LucideGauge
  ],
  templateUrl: './admin-cars.page.html',
  styleUrl: './admin-cars.page.scss'
})
export class AdminCarsPageComponent {
  private readonly carsService = inject(CarsFilterService);

  readonly search = signal('');

  readonly cars = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const list = this.carsService.cars.map(toAdminVehicle);
    if (!kw) return list;
    return list.filter((c) =>
      `${c.brand} ${c.model} ${c.variant} ${c.district} ${c.fuel}`
        .toLowerCase()
        .includes(kw)
    );
  });

  readonly totalCount = computed(() => this.cars().length);
}
