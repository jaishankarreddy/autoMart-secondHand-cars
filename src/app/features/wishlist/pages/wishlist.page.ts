import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideHeart, LucideCar, LucideBike } from '@lucide/angular';
import { NavbarComponent } from '../../home/components/navbar/navbar.component';
import { FooterComponent } from '../../home/components/footer/footer.component';
import { CarCardComponent } from '../../cars/components/car-card/car-card.component';
import { BikeCardComponent } from '../../bikes/components/bike-card/bike-card.component';
import { RippleDirective } from '../../cars/directives/ripple.directive';
import { RevealDirective } from '../../home/directives/reveal.directive';
import { CarsFilterService } from '../../cars/services/cars-filter.service';
import { BikesFilterService } from '../../bikes/services/bikes-filter.service';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [
    RouterLink,
    NavbarComponent,
    FooterComponent,
    CarCardComponent,
    BikeCardComponent,
    RippleDirective,
    RevealDirective,
    LucideHeart,
    LucideCar,
    LucideBike
  ],
  templateUrl: './wishlist.page.html'
})
export class WishlistPageComponent {
  private readonly carsService = inject(CarsFilterService);
  private readonly bikesService = inject(BikesFilterService);

  readonly wishlistedCars = computed(() =>
    this.carsService.cars().filter((c) => this.carsService.wishlist().has(c.id))
  );

  readonly wishlistedBikes = computed(() =>
    this.bikesService.bikes().filter((b) => this.bikesService.wishlist().has(b.id))
  );

  readonly totalCount = computed(
    () => this.wishlistedCars().length + this.wishlistedBikes().length
  );
}
