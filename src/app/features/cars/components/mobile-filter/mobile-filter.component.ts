import { Component, inject, signal } from '@angular/core';
import { LucideSlidersHorizontal, LucideX } from '@lucide/angular';
import { CarsFilterService } from '../../services/cars-filter.service';
import { FilterSidebarComponent } from '../filter-sidebar/filter-sidebar.component';
import { RippleDirective } from '../../directives/ripple.directive';

@Component({
  selector: 'app-mobile-filter',
  standalone: true,
  imports: [LucideSlidersHorizontal, LucideX, FilterSidebarComponent, RippleDirective],
  templateUrl: './mobile-filter.component.html',
  styleUrl: './mobile-filter.component.scss'
})
export class MobileFilterComponent {
  private readonly service = inject(CarsFilterService);

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
