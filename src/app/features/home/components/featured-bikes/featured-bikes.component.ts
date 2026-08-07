import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { CatalogService } from '../../../../services/catalog.service';
import { Vehicle } from '../../models/vehicle.model';
import { VehicleCardComponent } from '../vehicle-card/vehicle-card.component';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-featured-bikes',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, VehicleCardComponent, SectionHeadingComponent, RevealDirective],
  templateUrl: './featured-bikes.component.html'
})
export class FeaturedBikesComponent {
  private readonly catalog = inject(CatalogService);

  constructor() {
    this.catalog.load();
  }

  readonly bikes = computed(() =>
    this.catalog.featuredBikes().map((b) => ({
      ...b,
      type: 'bike' as const,
      location: b.district
    }) as unknown as Vehicle)
  );
}
