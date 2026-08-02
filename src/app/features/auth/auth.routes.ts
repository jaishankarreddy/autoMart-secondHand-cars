import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login.page';
import { RegisterPageComponent } from './pages/register.page';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent }
];
