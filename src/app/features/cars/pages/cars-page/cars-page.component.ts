import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../../../home/components/navbar/navbar.component';
import { FooterComponent } from '../../../home/components/footer/footer.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { SearchToolbarComponent } from '../../components/search-toolbar/search-toolbar.component';
import { ActiveFiltersComponent } from '../../components/active-filters/active-filters.component';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar.component';
import { MobileFilterComponent } from '../../components/mobile-filter/mobile-filter.component';
import { CarGridComponent } from '../../components/car-grid/car-grid.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { RippleDirective } from '../../directives/ripple.directive';
import { CarsFilterService } from '../../services/cars-filter.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-cars-page',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    PageHeaderComponent,
    SearchToolbarComponent,
    ActiveFiltersComponent,
    FilterSidebarComponent,
    MobileFilterComponent,
    CarGridComponent,
    PaginationComponent,
    RippleDirective
  ],
  templateUrl: './cars-page.component.html',
  styleUrl: './cars-page.component.scss'
})
export class CarsPageComponent {
  private readonly filterService = inject(CarsFilterService);
  private readonly toast = inject(ToastService);

  resetFilters(): void {
    this.filterService.resetFilters();
  }

  applyFilters(): void {
    this.toast.success(
      'Filters applied',
      `Showing ${this.filterService.totalCount()} matching car${this.filterService.totalCount() === 1 ? '' : 's'}.`
    );
    document.getElementById('results-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
