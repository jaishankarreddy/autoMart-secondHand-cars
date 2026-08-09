import { DecimalPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideHeart,
  LucideArrowRight,
  LucideStar,
  LucideShieldCheck,
  LucideGauge,
  LucideFuel,
  LucideCog,
  LucideMapPin,
  LucideScale
} from '@lucide/angular';
import { Car } from '../../models/car.model';
import { PricePipe } from '../../../home/pipes/price.pipe';
import { TiltDirective } from '../../../home/directives/tilt.directive';
import { WishlistService } from '../../../../services/wishlist.service';
import { CompareService } from '../../../compare/services/compare.service';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    LucideHeart,
    LucideArrowRight,
    LucideStar,
    LucideShieldCheck,
    LucideGauge,
    LucideFuel,
    LucideCog,
    LucideMapPin,
    LucideScale,
    PricePipe,
    TiltDirective
  ],
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.scss'
})
export class CarCardComponent {
  readonly car = input.required<Car>();
  readonly layout = input<'grid' | 'list'>('grid');

  private readonly wishlistService = inject(WishlistService);
  readonly compareService = inject(CompareService);

  readonly wishlisted = () => this.wishlistService.has(this.car().id);
  readonly compared = () => this.compareService.ids().includes(this.car().id);

  toggleWishlist(): void {
    this.wishlistService.toggle(this.car().id);
  }
}
