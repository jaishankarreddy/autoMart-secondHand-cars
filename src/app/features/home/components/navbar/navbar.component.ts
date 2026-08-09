import { Component, computed, inject, signal, DestroyRef, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideMenu,
  LucideX,
  LucideSearch,
  LucideHeart,
  LucideSun,
  LucideMoon,
  LucideCar,
  LucideScale,
  LucideLogOut,
  LucideUser
} from '@lucide/angular';
import { NAV_LINKS } from '../../data/home.data';
import { WishlistService } from '../../../../services/wishlist.service';
import { CompareService } from '../../../compare/services/compare.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../../services/toast.service';

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
    LucideCar,
    LucideScale,
    LucideLogOut,
    LucideUser
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly wishlistService = inject(WishlistService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly compareService = inject(CompareService);

  readonly links = NAV_LINKS;
  readonly wishlistCount = () => this.wishlistService.count();
  readonly compareCount = () => this.compareService.count();
  readonly isLoggedIn = () => this.auth.isAuthenticated();
  readonly userName = computed(() => this.auth.user()?.name ?? '');
  readonly userInitials = computed(() =>
    this.userName()
      .split(' ')
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  );
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

  logout(): void {
    this.auth.logout();
    this.toast.info('Logged out', 'You have been signed out. See you soon!');
  }
}
