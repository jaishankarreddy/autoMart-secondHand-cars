import { Routes } from '@angular/router';
import { AdminDashboardPageComponent } from './dashboard/pages/dashboard.page';
import { AdminVehiclesPageComponent } from './vehicles/pages/vehicles.page';
import { AdminCarsPageComponent } from './cars/pages/admin-cars.page';
import { AdminBikesPageComponent } from './bikes/pages/admin-bikes.page';
import { AdminOffersPageComponent } from './offers/pages/offers.page';
import { AdminContactsPageComponent } from './contacts/pages/contacts.page';
import { AdminSettingsPageComponent } from './settings/pages/settings.page';

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardPageComponent },
  { path: 'vehicles', component: AdminVehiclesPageComponent },
  { path: 'cars', component: AdminCarsPageComponent },
  { path: 'bikes', component: AdminBikesPageComponent },
  { path: 'offers', component: AdminOffersPageComponent },
  { path: 'contacts', component: AdminContactsPageComponent },
  { path: 'settings', component: AdminSettingsPageComponent }
];
