import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideWarehouse,
  LucideCar,
  LucideBike,
  LucideHandCoins,
  LucideMail,
  LucidePlus,
  LucideArrowUpRight,
  LucideTrendingUp
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { CarsFilterService } from '../../../cars/services/cars-filter.service';
import { BikesFilterService } from '../../../bikes/services/bikes-filter.service';
import { ADMIN_OFFERS, ADMIN_CONTACTS } from '../../data/admin.data';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink,
    RippleDirective,
    LucideWarehouse,
    LucideCar,
    LucideBike,
    LucideHandCoins,
    LucideMail,
    LucidePlus,
    LucideArrowUpRight,
    LucideTrendingUp
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class AdminDashboardPageComponent {
  private readonly carsService = inject(CarsFilterService);
  private readonly bikesService = inject(BikesFilterService);

  readonly totalCars = this.carsService.cars.length;
  readonly totalBikes = this.bikesService.bikes.length;
  readonly totalVehicles = this.totalCars + this.totalBikes;

  readonly pendingOffers = ADMIN_OFFERS.filter((o) => o.status === 'Pending').length;
  readonly newContacts = ADMIN_CONTACTS.filter((c) => c.status === 'New').length;
  readonly recentOffers = ADMIN_OFFERS.slice(0, 5);
  readonly latestContacts = ADMIN_CONTACTS.slice(0, 4);

  readonly brandStats = computed(() => {
    const map = new Map<string, number>();
    for (const c of this.carsService.cars) {
      map.set(c.brand, (map.get(c.brand) ?? 0) + 1);
    }
    for (const b of this.bikesService.bikes) {
      map.set(b.brand, (map.get(b.brand) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  });

  readonly maxBrandCount = computed(() =>
    Math.max(1, ...this.brandStats().map((s) => s.count))
  );

  barHeight(count: number): number {
    return Math.max(8, Math.round((count / this.maxBrandCount()) * 100));
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  formatPrice(value: number): string {
    return `₹${(value / 100000).toFixed(1)} L`;
  }
}
