import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { FEATURED_BIKES } from '../../data/vehicles.data';
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
  readonly bikes = FEATURED_BIKES;
}
