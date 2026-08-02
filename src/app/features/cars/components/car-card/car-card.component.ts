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
  LucideMapPin
} from '@lucide/angular';
import { Car } from '../../models/car.model';
import { PricePipe } from '../../../home/pipes/price.pipe';
import { TiltDirective } from '../../../home/directives/tilt.directive';
import { CarsFilterService } from '../../services/cars-filter.service';

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
    PricePipe,
    TiltDirective
  ],
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.scss'
})
export class CarCardComponent {
  readonly car = input.required<Car>();
  readonly layout = input<'grid' | 'list'>('grid');

  private readonly filterService = inject(CarsFilterService);

  readonly wishlisted = () => this.filterService.wishlist().has(this.car().id);

  toggleWishlist(): void {
    this.filterService.toggleWishlist(this.car().id);
  }
}
