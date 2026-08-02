import { Component, inject } from '@angular/core';
import { LucideSearch, LucideGrid3X3, LucideList, LucideX, LucideArrowUpDown } from '@lucide/angular';
import { BikesFilterService, BikeSortKey } from '../../services/bikes-filter.service';

@Component({
  selector: 'app-bike-search-toolbar',
  standalone: true,
  imports: [LucideSearch, LucideGrid3X3, LucideList, LucideX, LucideArrowUpDown],
  templateUrl: './search-toolbar.component.html',
  styleUrl: './search-toolbar.component.scss'
})
export class BikeSearchToolbarComponent {
  private readonly service = inject(BikesFilterService);

  readonly query = this.service.query;
  readonly gridView = this.service.gridView;
  readonly totalCount = this.service.totalCount;

  readonly sortOptions: { value: BikeSortKey; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'mileage', label: 'Best Mileage' },
    { value: 'year', label: 'Year' }
  ];

  onKeywordInput(value: string): void {
    this.service.setKeyword(value);
  }

  onSortChange(value: string): void {
    this.service.setSort(value as BikeSortKey);
  }

  clearKeyword(): void {
    this.service.setKeyword('');
  }

  setView(view: 'grid' | 'list'): void {
    this.service.setGridView(view);
  }
}
