import { Component, inject, signal } from '@angular/core';
import { LucideSlidersHorizontal, LucideX } from '@lucide/angular';
import { BikesFilterService } from '../../services/bikes-filter.service';
import { BikeFilterSidebarComponent } from '../filter-sidebar/filter-sidebar.component';
import { RippleDirective } from '../../../cars/directives/ripple.directive';

@Component({
  selector: 'app-bike-mobile-filter',
  standalone: true,
  imports: [LucideSlidersHorizontal, LucideX, BikeFilterSidebarComponent, RippleDirective],
  templateUrl: './mobile-filter.component.html',
  styleUrl: './mobile-filter.component.scss'
})
export class BikeMobileFilterComponent {
  private readonly service = inject(BikesFilterService);

  readonly open = signal(false);
  readonly activeFilterCount = this.service.activeFilterCount;
  readonly resultCount = this.service.totalCount;

  openDrawer(): void {
    this.open.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeDrawer(): void {
    this.open.set(false);
    document.body.style.overflow = '';
  }
}
