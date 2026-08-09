import { Component, inject } from '@angular/core';
import { BikeCardComponent } from '../bike-card/bike-card.component';
import { BikeEmptyStateComponent } from '../empty-state/empty-state.component';
import { BikesFilterService } from '../../services/bikes-filter.service';

@Component({
  selector: 'app-bike-grid',
  standalone: true,
  imports: [BikeCardComponent, BikeEmptyStateComponent],
  templateUrl: './bike-grid.component.html',
  styleUrl: './bike-grid.component.scss'
})
export class BikeGridComponent {
  private readonly service = inject(BikesFilterService);

  readonly bikes = this.service.pagedBikes;
  readonly gridView = this.service.gridView;
  readonly totalCount = this.service.totalCount;
  readonly totalPages = this.service.totalPages;
  readonly page = this.service.page;
  readonly loading = this.service.loading;

  trackById(_: number, bike: { id: string }): string {
    return bike.id;
  }
}
