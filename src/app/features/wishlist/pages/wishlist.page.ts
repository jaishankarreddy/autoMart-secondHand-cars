import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHeart, LucideArrowRight, LucideScale } from '@lucide/angular';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { CatalogService, CatalogVehicle } from '../../../services/catalog.service';
import { WishlistService } from '../../../services/wishlist.service';
import { CompareService } from '../../compare/services/compare.service';

interface DisplayVehicle {
  id: string;
  name: string;
  type: string;
  price: string;
  meta: string;
  image: string;
  tag: string;
}

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [
    RouterLink,
    FooterComponent,
    LucideHeart,
    LucideArrowRight,
    LucideScale
  ],
  templateUrl: './wishlist.page.html',
  styleUrl: './wishlist.page.scss'
})
export class WishlistPageComponent {
  private readonly catalog = inject(CatalogService);
  private readonly wishlistService = inject(WishlistService);
  readonly compareService = inject(CompareService);

  constructor() {
    this.catalog.load();
  }

  private toDisplay(v: CatalogVehicle): DisplayVehicle {
    return {
      id: v.id,
      name: `${v.year} ${v.brand} ${v.model}`,
      type: v.vehicleType === 'car' ? 'Car' : 'Bike',
      price: `₹${Math.round(v.price).toLocaleString('en-IN')}`,
      meta: `${v.kilometers?.toLocaleString('en-IN') ?? 0} km  •  ${v.transmission}`,
      image: v.image,
      tag: 'Saved'
    };
  }

  readonly wishlistedVehicles = computed<DisplayVehicle[]>(() =>
    this.catalog.vehicles()
      .filter((v) => this.wishlistService.has(v.id))
      .map((v) => this.toDisplay(v))
  );

  readonly totalCount = computed(() => this.wishlistService.count());

  wishlisted(id: string): boolean {
    return this.wishlistService.has(id);
  }

  toggleWishlist(id: string): void {
    this.wishlistService.toggle(id);
  }

  compared(id: string): boolean {
    return this.compareService.ids().includes(id);
  }
}
