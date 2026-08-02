import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import {
  LucideCar,
  LucideLayoutDashboard,
  LucideWarehouse,
  LucideBike,
  LucideHandCoins,
  LucideMail,
  LucideSettings,
  LucideExternalLink,
  LucideLogOut,
  LucideMenu,
  LucideX,
  LucideSun,
  LucideMoon,
  LucideBell,
  LucideChevronsLeft,
  LucideChevronsRight,
  LucideSearch
} from '@lucide/angular';

interface NavItem {
  path: string;
  label: string;
  icon: 'dashboard' | 'warehouse' | 'car' | 'bike' | 'offers' | 'mail' | 'settings';
  badge?: number;
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  vehicles: 'Vehicles',
  cars: 'Cars',
  bikes: 'Bikes',
  offers: 'Offers',
  contacts: 'Contact Enquiries',
  settings: 'Settings',
  login: 'Sign in'
};

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideCar,
    LucideLayoutDashboard,
    LucideWarehouse,
    LucideBike,
    LucideHandCoins,
    LucideMail,
    LucideSettings,
    LucideExternalLink,
    LucideLogOut,
    LucideMenu,
    LucideX,
    LucideSun,
    LucideMoon,
    LucideBell,
    LucideChevronsLeft,
    LucideChevronsRight,
    LucideSearch
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly collapsed = signal(false);
  readonly mobileOpen = signal(false);
  readonly pageTitle = signal('Dashboard');
  readonly currentYear = new Date().getFullYear();
  readonly dark = signal(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  readonly navItems: NavItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/admin/vehicles', label: 'Vehicles', icon: 'warehouse', badge: 32 },
    { path: '/admin/cars', label: 'Cars', icon: 'car' },
    { path: '/admin/bikes', label: 'Bikes', icon: 'bike' },
    { path: '/admin/offers', label: 'Offers', icon: 'offers', badge: 4 },
    { path: '/admin/contacts', label: 'Contacts', icon: 'mail', badge: 2 },
    { path: '/admin/settings', label: 'Settings', icon: 'settings' }
  ];

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const segment = this.router.url.split('?')[0].split('/').filter(Boolean).pop() ?? 'dashboard';
        this.pageTitle.set(PAGE_TITLES[segment] ?? 'Admin');
        this.mobileOpen.set(false);
      });
  }

  toggleSidebar(): void {
    this.collapsed.update((v) => !v);
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  toggleTheme(): void {
    const next = !this.dark();
    this.dark.set(next);
    document.documentElement.classList.toggle('dark', next);
  }
}
