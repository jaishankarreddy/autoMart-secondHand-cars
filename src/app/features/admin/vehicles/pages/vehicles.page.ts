import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  LucidePlus,
  LucideSearch,
  LucideCar,
  LucideBike,
  LucideMapPin,
  LucideEye,
  LucidePencil,
  LucideTrash2
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { CarsFilterService } from '../../../cars/services/cars-filter.service';
import { BikesFilterService } from '../../../bikes/services/bikes-filter.service';
import { toAdminVehicle } from '../../utils/vehicle.util';

export type AdminTypeFilter = 'all' | 'car' | 'bike';

@Component({
  selector: 'app-vehicles-page',
  standalone: true,
  imports: [
    DecimalPipe,
    RippleDirective,
    LucidePlus,
    LucideSearch,
    LucideCar,
    LucideBike,
    LucideMapPin,
    LucideEye,
    LucidePencil,
    LucideTrash2
  ],
  templateUrl: './vehicles.page.html',
  styleUrl: './vehicles.page.scss'
})
export class AdminVehiclesPageComponent {
  private readonly carsService = inject(CarsFilterService);
  private readonly bikesService = inject(BikesFilterService);

  readonly search = signal('');
  readonly typeFilter = signal<AdminTypeFilter>('all');

  readonly vehicles = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const type = this.typeFilter();
    const list = [
      ...this.carsService.cars().map(toAdminVehicle),
      ...this.bikesService.bikes().map(toAdminVehicle)
    ];
    return list.filter((v) => {
      if (type !== 'all' && v.type !== type) return false;
      if (
        kw &&
        !`${v.brand} ${v.model} ${v.variant} ${v.district} ${v.fuel}`
          .toLowerCase()
          .includes(kw)
      ) {
        return false;
      }
      return true;
    });
  });

  readonly totalCount = computed(() => this.vehicles().length);
  readonly availableCount = computed(
    () => this.vehicles().filter((v) => v.status === 'Available').length
  );

  readonly typeOptions: { value: AdminTypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'car', label: 'Cars' },
    { value: 'bike', label: 'Bikes' }
  ];
}
