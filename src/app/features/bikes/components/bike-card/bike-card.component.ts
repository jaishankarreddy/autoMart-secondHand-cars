import { DecimalPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideHeart,
  LucideShieldCheck,
  LucideGauge,
  LucideFuel,
  LucideCog,
  LucideMapPin,
  LucideArrowRight,
  LucideScale
} from '@lucide/angular';
import { Bike } from '../../models/bike.model';
import { PricePipe } from '../../../home/pipes/price.pipe';
import { TiltDirective } from '../../../home/directives/tilt.directive';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { WishlistService } from '../../../../services/wishlist.service';
import { CompareService } from '../../../compare/services/compare.service';

@Component({
  selector: 'app-bike-card',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    LucideHeart,
    LucideShieldCheck,
    LucideGauge,
    LucideFuel,
    LucideCog,
    LucideMapPin,
    LucideArrowRight,
    LucideScale,
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

  private readonly wishlistService = inject(WishlistService);
  readonly compareService = inject(CompareService);

  readonly wishlisted = () => this.wishlistService.has(this.bike().id);
  readonly compared = () => this.compareService.ids().includes(this.bike().id);

  toggleWishlist(): void {
    this.wishlistService.toggle(this.bike().id);
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
