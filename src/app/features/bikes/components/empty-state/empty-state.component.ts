import { Component, inject } from '@angular/core';
import { LucideSearchX, LucideRotateCcw } from '@lucide/angular';
import { BikesFilterService } from '../../services/bikes-filter.service';
import { RippleDirective } from '../../../cars/directives/ripple.directive';

@Component({
  selector: 'app-bike-empty-state',
  standalone: true,
  imports: [LucideSearchX, LucideRotateCcw, RippleDirective],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class BikeEmptyStateComponent {
  private readonly service = inject(BikesFilterService);

  readonly totalCount = this.service.totalCount;

  clearAll(): void {
    this.service.resetAll();
  }
}
