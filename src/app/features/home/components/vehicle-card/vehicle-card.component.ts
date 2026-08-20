import { DecimalPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideHeart,
  LucideArrowRight,
  LucideShieldCheck,
  LucideScale
} from '@lucide/angular';
import { Vehicle } from '../../models/vehicle.model';
import { PricePipe } from '../../pipes/price.pipe';
import { TiltDirective } from '../../directives/tilt.directive';
import { WishlistService } from '../../../../services/wishlist.service';
import { CompareService } from '../../../compare/services/compare.service';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [
    RouterLink,
    LucideHeart,
    LucideArrowRight,
    LucideShieldCheck,
    LucideScale,
    PricePipe,
    DecimalPipe,
    TiltDirective
  ],
  templateUrl: './vehicle-card.component.html',
  styleUrl: './vehicle-card.component.scss'
})
export class VehicleCardComponent {
  readonly vehicle = input.required<Vehicle>();

  private readonly wishlistService = inject(WishlistService);
  readonly compareService = inject(CompareService);

  readonly wishlisted = () => this.wishlistService.has(this.vehicle().id);
  readonly compared = () => this.compareService.ids().includes(this.vehicle().id);

  toggleWishlist(): void {
    this.wishlistService.toggle(this.vehicle().id);
  }
}
