import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../../home/components/navbar/navbar.component';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { BikePageHeaderComponent } from '../components/page-header/page-header.component';
import { BikeSearchToolbarComponent } from '../components/search-toolbar/search-toolbar.component';
import { BikeActiveFiltersComponent } from '../components/active-filters/active-filters.component';
import { BikeFilterSidebarComponent } from '../components/filter-sidebar/filter-sidebar.component';
import { BikeMobileFilterComponent } from '../components/mobile-filter/mobile-filter.component';
import { BikeGridComponent } from '../components/bike-grid/bike-grid.component';
import { BikePaginationComponent } from '../components/pagination/pagination.component';
import { RippleDirective } from '../../cars/directives/ripple.directive';
import { BikesFilterService } from '../services/bikes-filter.service';

@Component({
  selector: 'app-bikes-list-page',
  standalone: true,
  imports: [
    NavbarComponent,
    FooterComponent,
    BikePageHeaderComponent,
    BikeSearchToolbarComponent,
    BikeActiveFiltersComponent,
    BikeFilterSidebarComponent,
    BikeMobileFilterComponent,
    BikeGridComponent,
    BikePaginationComponent,
    RippleDirective
  ],
  templateUrl: './bikes-list.page.html',
  styleUrl: './bikes-list.page.scss'
})
export class BikesListPageComponent {
  private readonly filterService = inject(BikesFilterService);

  resetFilters(): void {
    this.filterService.resetFilters();
  }
}
