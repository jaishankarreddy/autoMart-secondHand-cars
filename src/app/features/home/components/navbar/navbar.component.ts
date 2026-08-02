import { Component, inject, signal, DestroyRef, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideMenu,
  LucideX,
  LucideSearch,
  LucideHeart,
  LucideSun,
  LucideMoon,
  LucideCar
} from '@lucide/angular';
import { NAV_LINKS } from '../../data/home.data';
import { CarsFilterService } from '../../../cars/services/cars-filter.service';
import { BikesFilterService } from '../../../bikes/services/bikes-filter.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideMenu,
    LucideX,
    LucideSearch,
    LucideHeart,
    LucideSun,
    LucideMoon,
    LucideCar
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly carsService = inject(CarsFilterService);
  private readonly bikesService = inject(BikesFilterService);

  readonly links = NAV_LINKS;
  readonly wishlistCount = () =>
    this.carsService.wishlist().size + this.bikesService.wishlist().size;
  readonly scrolled = signal(false);
  readonly hidden = signal(false);
  readonly menuOpen = signal(false);
  readonly dark = signal(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      this.scrolled.set(y > 24);
      const delta = y - lastY;
      if (Math.abs(delta) > 6) {
        this.hidden.set(delta > 0 && y > 140);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
  }

  toggleTheme(): void {
    const next = !this.dark();
    this.dark.set(next);
    document.documentElement.classList.toggle('dark', next);
  }
}
