import { Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { LucideChevronLeft, LucideChevronRight } from '@lucide/angular';
import { Car } from '../../../cars/models/car.model';
import { CarCardComponent } from '../../../cars/components/car-card/car-card.component';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { SectionHeadingComponent } from '../../../home/components/section-heading/section-heading.component';
import { RevealDirective } from '../../../home/directives/reveal.directive';

@Component({
  selector: 'app-similar-vehicles',
  standalone: true,
  imports: [LucideChevronLeft, LucideChevronRight, CarCardComponent, RippleDirective, SectionHeadingComponent, RevealDirective],
  templateUrl: './similar-vehicles.component.html',
  styleUrl: './similar-vehicles.component.scss'
})
export class SimilarVehiclesComponent {
  readonly vehicles = input.required<Car[]>();

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  scroll(dir: 1 | -1): void {
    const el = this.track()?.nativeElement;
    if (!el) {
      return;
    }
    const card = el.querySelector('app-car-card') as HTMLElement | null;
    const step = (card?.offsetWidth ?? 320) + 24;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
}
