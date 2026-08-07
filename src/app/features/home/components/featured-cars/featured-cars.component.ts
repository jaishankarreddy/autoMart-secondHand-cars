import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { CatalogService } from '../../../../services/catalog.service';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleCardComponent } from '../vehicle-card/vehicle-card.component';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-featured-cars',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, VehicleCardComponent, SectionHeadingComponent, RevealDirective],
  templateUrl: './featured-cars.component.html'
})
export class FeaturedCarsComponent {
  private readonly catalog = inject(CatalogService);

  constructor() {
    this.catalog.load();
  }

  readonly cars = computed(() =>
    this.catalog.featuredCars().map((c) => ({
      ...c,
      type: 'car' as const,
      location: c.district
    }) as unknown as Vehicle)
  );
}
