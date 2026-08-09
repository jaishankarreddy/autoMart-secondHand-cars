import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideShieldCheck,
  LucideMail,
  LucideLock,
  LucideArrowRight,
  LucideEye,
  LucideEyeOff,
  LucideKeyRound,
  LucideLoaderCircle
} from '@lucide/angular';
import { RippleDirective } from '../../../cars/directives/ripple.directive';
import { AdminAuthService } from '../../services/admin-auth.service';
import { ToastService } from '../../../../services/toast.service';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

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
    LucideKeyRound,
    LucideLoaderCircle
  ],
  templateUrl: './admin-login.page.html',
  styleUrl: './admin-login.page.scss'
})
export class AdminLoginPageComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AdminAuthService);
  private readonly toast = inject(ToastService);

  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const email = this.email().trim();
    if (!email || !this.password()) {
      this.error.set('Please enter your email and password.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      this.error.set('Please enter a valid email address.');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.auth.login(email, this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Welcome back', 'Signed in to the admin panel.');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const message =
          err?.error?.message || 'Sign in failed. Check your credentials and try again.';
        this.error.set(message);
      }
    });
  }
}
