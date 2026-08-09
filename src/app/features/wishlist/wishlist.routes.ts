import { Routes } from '@angular/router';
import { WishlistPageComponent } from './pages/wishlist.page';
import { authGuard } from '../auth/services/auth.guard';

export const WISHLIST_ROUTES: Routes = [
  {
    path: '',
    component: WishlistPageComponent,
    canActivate: [authGuard]
  }
];
