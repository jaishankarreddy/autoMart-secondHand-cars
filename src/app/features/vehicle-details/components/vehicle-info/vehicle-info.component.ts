import { Component, inject, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LucideHeart, LucideMapPin, LucideShare, LucideStar, LucideBadgeCheck, LucideClock, LucideScale } from '@lucide/angular';
import { VehicleDetail } from '../../models/vehicle-detail.model';
import { WishlistService } from '../../../../services/wishlist.service';
import { CompareService } from '../../../compare/services/compare.service';
import { RippleDirective } from '../../../cars/directives/ripple.directive';

@Component({
  selector: 'app-vehicle-info',
  standalone: true,
  imports: [
    DecimalPipe,
    LucideHeart,
    LucideMapPin,
    LucideShare,
    LucideStar,
    LucideBadgeCheck,
    LucideClock,
    LucideScale,
    RippleDirective
  ],
  templateUrl: './vehicle-info.component.html',
  styleUrl: './vehicle-info.component.scss'
})
export class VehicleInfoComponent {
  readonly vehicle = input.required<VehicleDetail>();

  private readonly wishlistService = inject(WishlistService);
  readonly compareService = inject(CompareService);

  readonly wishlisted = () => this.wishlistService.has(this.vehicle().id);
  readonly compared = () => this.compareService.ids().includes(this.vehicle().id);

  /** Indian-formatted full rupee price, e.g. ₹17,85,000 */
  readonly priceInRupees = () =>
    (this.vehicle().priceInLakh * 100000).toLocaleString('en-IN');

  toggleWishlist(): void {
    this.wishlistService.toggle(this.vehicle().id);
  }

  share(): void {
    const text = `${this.vehicle().brand} ${this.vehicle().model} ${this.vehicle().variant} — ${this.vehicle().location}`;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'AutoMart', text, url }).catch(() => undefined);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${url}`).catch(() => undefined);
    }
  }

  readonly availabilityLabel: Record<string, string> = {
    available: 'Available',
    reserved: 'Reserved',
    sold: 'Sold'
  };
}
