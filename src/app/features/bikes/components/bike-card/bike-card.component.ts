import { DecimalPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import {
  LucideHeart,
  LucideStar,
  LucideShieldCheck,
  LucideGauge,
  LucideFuel,
  LucideCog,
  LucideMapPin,
  LucideArrowRight
} from '@lucide/angular';
import { Bike } from '../../models/bike.model';
import { PricePipe } from '../../../home/pipes/price.pipe';
import { TiltDirective } from '../../../home/directives/tilt.directive';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { BikesFilterService } from '../../services/bikes-filter.service';

@Component({
  selector: 'app-bike-card',
  standalone: true,
  imports: [
    DecimalPipe,
    LucideHeart,
    LucideStar,
    LucideShieldCheck,
    LucideGauge,
    LucideFuel,
    LucideCog,
    LucideMapPin,
    LucideArrowRight,
    PricePipe,
    TiltDirective,
    RippleDirective
  ],
  templateUrl: './bike-card.component.html',
  styleUrl: './bike-card.component.scss'
})
export class BikeCardComponent {
  readonly bike = input.required<Bike>();
  readonly layout = input<'grid' | 'list'>('grid');

  private readonly filterService = inject(BikesFilterService);

  readonly wishlisted = () => this.filterService.wishlist().has(this.bike().id);

  toggleWishlist(): void {
    this.filterService.toggleWishlist(this.bike().id);
  }

  /** Engine label: "149 cc" or "Electric" */
  readonly engineLabel = () =>
    this.bike().engineCC > 0 ? `${this.bike().engineCC} cc` : 'Electric';

  /** Mileage label: "60 km/l" for petrol, "116 km/charge" for electric */
  readonly mileageLabel = () =>
    this.bike().fuel === 'Electric'
      ? `${this.bike().mileage} km/charge`
      : `${this.bike().mileage} km/l`;
}
