import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideEye,
  LucideEyeOff,
  LucideMail,
  LucideLock,
  LucideSmartphone,
  LucideLogIn,
  LucideShieldCheck
} from '@lucide/angular';
import { RippleDirective } from '../../cars/directives/ripple.directive';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    RouterLink,
    RippleDirective,
    LucideEye,
    LucideEyeOff,
    LucideMail,
    LucideLock,
    LucideSmartphone,
    LucideLogIn,
    LucideShieldCheck
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPageComponent {
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly remember = signal(false);
  readonly showPassword = signal(false);
  readonly error = signal('');

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.email().trim() || !this.password()) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.error.set('');
    this.router.navigate(['/home']);
  }
}
