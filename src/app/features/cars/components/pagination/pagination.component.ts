import { Component, inject } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { CarsFilterService } from '../../services/cars-filter.service';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [LucideChevronLeft, LucideChevronRight],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  private readonly service = inject(CarsFilterService);

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
