import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import {
  LucidePlus,
  LucideSearch,
  LucideMapPin,
  LucidePencil,
  LucideTrash2,
  LucideGauge,
  LucideZap,
  LucideShieldCheck
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { BikesFilterService } from '../../../bikes/services/bikes-filter.service';
import { CatalogService } from '../../../../services/catalog.service';
import { toAdminVehicle } from '../../utils/vehicle.util';

@Component({
  selector: 'app-admin-bikes-page',
  standalone: true,
  imports: [
    DecimalPipe,
    RippleDirective,
    LucidePlus,
    LucideSearch,
    LucideMapPin,
    LucidePencil,
    LucideTrash2,
    LucideGauge,
    LucideZap,
    LucideShieldCheck
  ],
  templateUrl: './admin-bikes.page.html',
  styleUrl: './admin-bikes.page.scss'
})
export class AdminBikesPageComponent {
  private readonly bikesService = inject(BikesFilterService);
  private readonly catalog = inject(CatalogService);

  constructor() {
    this.catalog.load();
  }

  readonly search = signal('');

  readonly bikes = computed(() => {
    const kw = this.search().trim().toLowerCase();
    const list = this.bikesService.bikes().map(toAdminVehicle);
    if (!kw) return list;
    return list.filter((b) =>
      `${b.brand} ${b.model} ${b.variant} ${b.district} ${b.fuel}`
        .toLowerCase()
        .includes(kw)
    );
  });

  readonly totalCount = computed(() => this.bikes().length);
}
