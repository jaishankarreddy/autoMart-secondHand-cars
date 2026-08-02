import { Component, inject } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { BikesFilterService } from '../../services/bikes-filter.service';

@Component({
  selector: 'app-bike-pagination',
  standalone: true,
  imports: [LucideChevronLeft, LucideChevronRight],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class BikePaginationComponent {
  private readonly service = inject(BikesFilterService);

  readonly page = this.service.page;
  readonly totalPages = this.service.totalPages;
  readonly pageNumbers = this.service.pageNumbers;
  readonly pageRange = this.service.pageRange;
  readonly totalCount = this.service.totalCount;

  goTo(p: number | 'ellipsis'): void {
    if (p !== 'ellipsis') {
      this.service.setPage(p);
    }
  }

  next(): void {
    this.service.setPage(this.page() + 1);
  }

  prev(): void {
    this.service.setPage(this.page() - 1);
  }
}
