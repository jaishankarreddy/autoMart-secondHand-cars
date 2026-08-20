import { Routes } from '@angular/router';
import { InventoryPageComponent } from '../inventory/pages/inventory-page/inventory-page.component';

export const BIKES_ROUTES: Routes = [
  {
    path: '',
    component: InventoryPageComponent,
    data: { type: 'bike' }
  }
];