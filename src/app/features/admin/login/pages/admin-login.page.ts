import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideShieldCheck,
  LucideMail,
  LucideLock,
  LucideArrowRight,
  LucideEye,
  LucideEyeOff,
  LucideKeyRound
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';

@Component({
  selector: 'app-admin-login-page',
  standalone: true,
  imports: [
    RouterLink,
    RippleDirective,
    LucideShieldCheck,
    LucideMail,
    LucideLock,
    LucideArrowRight,
    LucideEye,
    LucideEyeOff,
    LucideKeyRound
  ],
  templateUrl: './admin-login.page.html',
  styleUrl: './admin-login.page.scss'
})
export class AdminLoginPageComponent {
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly error = signal('');

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.email().trim() || !this.password()) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.error.set('');
    this.router.navigate(['/admin/dashboard']);
  }
}
