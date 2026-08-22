import { Routes } from '@angular/router';
import { PublicLayoutComponent, AdminLayoutComponent, AuthLayoutComponent } from '../layouts';
import { adminAuthGuard } from '../features/admin/services/admin-auth.guard';

export const routes: Routes = [
  // Public routes wrapped in PublicLayout
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadChildren: () => import('@features/home/home.routes').then(m => m.HOME_ROUTES)
      },
      {
        path: 'cars',
        loadChildren: () => import('@features/cars/cars.routes').then(m => m.CARS_ROUTES)
      },
      {
        path: 'bikes',
        loadChildren: () => import('@features/bikes/bikes.routes').then(m => m.BIKES_ROUTES)
      },
      {
        path: 'vehicles/:id',
        loadChildren: () => import('@features/vehicle-details/vehicle-details.routes').then(m => m.VEHICLE_DETAILS_ROUTES)
      },
      {
        path: 'search',
        loadChildren: () => import('@features/search/search.routes').then(m => m.SEARCH_ROUTES)
      },
      {
        path: 'compare',
        loadChildren: () => import('@features/compare/compare.routes').then(m => m.COMPARE_ROUTES)
      },
      {
        path: 'wishlist',
        loadChildren: () => import('@features/wishlist/wishlist.routes').then(m => m.WISHLIST_ROUTES)
      },
      {
        path: 'brands',
        loadChildren: () => import('@features/brands/brands.routes').then(m => m.BRANDS_ROUTES)
      },
      {
        path: 'about',
        loadChildren: () => import('@features/about/about.routes').then(m => m.ABOUT_ROUTES)
      },
      {
        path: 'contact',
        loadChildren: () => import('@features/contact/contact.routes').then(m => m.CONTACT_ROUTES)
      }
    ]
  },
  // Auth routes wrapped in AuthLayout
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  // Admin login (full-screen, outside the admin layout)
  {
    path: 'admin/login',
    loadComponent: () =>
      import('../features/admin/login/pages/admin-login.page').then(
        (m) => m.AdminLoginPageComponent
      )
  },
  // Admin routes wrapped in AdminLayout
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    loadChildren: () => import('@features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // Fallback catch-all route
  {
    path: '**',
    redirectTo: 'home'
  }
];
