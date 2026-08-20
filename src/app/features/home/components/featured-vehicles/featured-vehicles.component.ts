import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBike,
  LucideCarFront,
  LucideHeart,
  LucideScale
} from '@lucide/angular';
import { CatalogService } from '../../../../services/catalog.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { CompareService } from '../../../compare/services/compare.service';
import { RevealDirective } from '../../directives/reveal.directive';

export type FeatureType = 'All' | 'Cars' | 'Bikes';

interface DisplayVehicle {
  id: string;
  name: string;
  type: string;
  price: string;
  meta: string;
  image: string;
  tag: string;
}

interface Heading {
  title: string;
  subtitle: string;
  link: string;
  linkLabel: string;
}

const HERO_IMAGE = 'https://images.pexels.com/photos/28380935/pexels-photo-28380935.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

@Component({
  selector: 'app-featured-vehicles',
  standalone: true,
  imports: [RouterLink, LucideArrowRight, LucideBike, LucideCarFront, LucideHeart, LucideScale, RevealDirective],
  templateUrl: './featured-vehicles.component.html',
  styleUrl: './featured-vehicles.component.scss'
})
export class FeaturedVehiclesComponent {
  private readonly catalog = inject(CatalogService);
  private readonly wishlistService = inject(WishlistService);
  readonly compareService = inject(CompareService);

  readonly activeType = signal<FeatureType>('All');

  constructor() {
    this.catalog.load();
  }

  private readonly toDisplay = (vehicles: { id: string; brand: string; model: string; year: number; price: number; kilometers?: number; transmission?: string; image?: string }[], isCar: boolean): DisplayVehicle[] =>
    vehicles.slice(0, 8).map((v) => ({
      id: v.id,
      name: `${v.year} ${v.brand} ${v.model}`,
      type: isCar ? 'Car' : 'Bike',
      price: `₹${Math.round(v.price).toLocaleString('en-IN')}`,
      meta: `${v.kilometers?.toLocaleString('en-IN') ?? 0} km  •  ${v.transmission}`,
      image: v.image || HERO_IMAGE,
      tag: 'Just listed'
    }));

  readonly carsToShow = computed<DisplayVehicle[]>(() => this.toDisplay(this.catalog.featuredCars(), true));
  readonly bikesToShow = computed<DisplayVehicle[]>(() => this.toDisplay(this.catalog.featuredBikes(), false));

  readonly visibleVehicles = computed<DisplayVehicle[]>(() => {
    const type = this.activeType();
    if (type === 'All') return [...this.carsToShow(), ...this.bikesToShow()];
    if (type === 'Cars') return this.carsToShow();
    return this.bikesToShow();
  });

  readonly heading = computed<Heading>(() => {
    switch (this.activeType()) {
      case 'Cars':
        return {
          title: 'Handpicked cars, ready to drive',
          subtitle: 'Inspected, certified and priced transparently — our most-loved pre-owned cars across Karnataka.',
          link: '/cars',
          linkLabel: 'cars'
        };
      case 'Bikes':
        return {
          title: 'Two wheels, endless freedom',
          subtitle: 'From classic cruisers to performance sport bikes — certified and ready to ride across Karnataka.',
          link: '/bikes',
          linkLabel: 'bikes'
        };
      default:
        return {
          title: 'Featured Vehicles',
          subtitle: 'A handpicked mix of our most-loved pre-owned cars and bikes, inspected and ready to go across Karnataka.',
          link: '/cars',
          linkLabel: 'vehicles'
        };
    }
  });

  setType(type: string): void {
    this.activeType.set(type as FeatureType);
  }

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