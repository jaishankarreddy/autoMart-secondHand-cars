import { Component, inject } from '@angular/core';
import { CarCardComponent } from '../car-card/car-card.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { CarsFilterService } from '../../services/cars-filter.service';

@Component({
  selector: 'app-car-grid',
  standalone: true,
  imports: [CarCardComponent, EmptyStateComponent],
  templateUrl: './car-grid.component.html',
  styleUrl: './car-grid.component.scss'
})
export class CarGridComponent {
  private readonly service = inject(CarsFilterService);

  readonly cars = this.service.pagedCars;
  readonly gridView = this.service.gridView;
  readonly totalCount = this.service.totalCount;
  readonly totalPages = this.service.totalPages;
  readonly page = this.service.page;
  readonly loading = this.service.loading;

  trackById(_: number, car: { id: string }): string {
    return car.id;
  }
}
