import { Component, inject } from '@angular/core';
import { LucideSearchX, LucideRotateCcw } from '@lucide/angular';
import { CarsFilterService } from '../../services/cars-filter.service';
import { RippleDirective } from '../../directives/ripple.directive';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [LucideSearchX, LucideRotateCcw, RippleDirective],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  private readonly service = inject(CarsFilterService);

  readonly totalCount = this.service.totalCount;

  clearAll(): void {
    this.service.resetAll();
  }
}
