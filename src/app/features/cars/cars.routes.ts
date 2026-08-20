import { Routes } from '@angular/router';
import { InventoryPageComponent } from '../inventory/pages/inventory-page/inventory-page.component';

export const CARS_ROUTES: Routes = [
  {
    path: '',
    component: InventoryPageComponent,
    data: { type: 'car' }
  }
];