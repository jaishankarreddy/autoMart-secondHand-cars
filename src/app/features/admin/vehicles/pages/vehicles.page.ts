import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucidePlus,
  LucideSearch,
  LucideCar,
  LucideBike,
  LucideMapPin,
  LucideEye,
  LucidePencil,
  LucideTrash2,
  LucideLoaderCircle
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { CarsFilterService } from '../../../cars/services/cars-filter.service';
import { BikesFilterService } from '../../../bikes/services/bikes-filter.service';
import { CatalogService } from '../../../../services/catalog.service';
import { AdminService } from '../../services/admin.service';
import { toAdminVehicle, AdminVehicle } from '../../utils/vehicle.util';
import { VehicleFormModalComponent } from '../components/vehicle-form-modal/vehicle-form-modal';
import { ToastService } from '../../../../services/toast.service';

export type AdminTypeFilter = 'all' | 'car' | 'bike';

@Component({
  selector: 'app-vehicles-page',
  standalone: true,
  imports: [
    DecimalPipe,
    RippleDirective,
    VehicleFormModalComponent,
    LucidePlus,
    LucideSearch,
    LucideCar,
    LucideBike,
    LucideMapPin,
    LucideEye,
    LucidePencil,
    LucideTrash2,
    LucideLoaderCircle
  ],
  templateUrl: './vehicles.page.html',
  styleUrl: './vehicles.page.scss'
})
export class AdminVehiclesPageComponent {
  private readonly carsService = inject(CarsFilterService);
  private readonly bikesService = inject(BikesFilterService);
  private readonly catalog = inject(CatalogService);
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly search = signal('');
  readonly typeFilter = signal<AdminTypeFilter>('all');
  readonly formOpen = signal(false);
  readonly formModel = signal<AdminVehicle | null>(null);
  readonly deletingId = signal<string | null>(null);

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

  constructor() {
    this.catalog.load();
  }

  openAdd(): void {
    this.formModel.set(null);
    this.formOpen.set(true);
  }

  openEdit(vehicle: AdminVehicle): void {
    this.formModel.set(vehicle);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
  }

  onSaved(): void {
    this.formOpen.set(false);
    this.catalog.refresh();
    this.carsService.refresh();
    this.bikesService.refresh();
    this.toast.success(
      this.formModel() ? 'Vehicle updated' : 'Vehicle added',
      this.formModel()
        ? 'The listing was saved to the catalogue.'
        : 'Your new vehicle listing is now live on the marketplace.'
    );
  }

  viewVehicle(vehicle: AdminVehicle): void {
    this.router.navigate(['/vehicles', vehicle.id]);
  }

  deleteVehicle(vehicle: AdminVehicle): void {
    const ok = window.confirm(
      `Delete "${vehicle.brand} ${vehicle.model} ${vehicle.variant}"?\nThis cannot be undone.`
    );
    if (!ok) return;
    this.deletingId.set(vehicle.id);
    this.adminService.remove(vehicle.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.catalog.refresh();
        this.toast.success('Vehicle deleted', `${vehicle.brand} ${vehicle.model} was removed from the catalogue.`);
      },
      error: () => {
        this.deletingId.set(null);
        this.toast.error('Could not delete vehicle', 'Please try again in a moment.');
      }
    });
  }
}