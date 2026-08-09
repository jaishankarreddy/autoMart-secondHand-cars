import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideEye,
  LucideEyeOff,
  LucideMail,
  LucideLock,
  LucideUser,
  LucideUserPlus,
  LucideShieldCheck,
  LucideLoaderCircle
} from '@lucide/angular';
import { RippleDirective } from '../../cars/directives/ripple.directive';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../../services/toast.service';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    RouterLink,
    RippleDirective,
    LucideEye,
    LucideEyeOff,
    LucideMail,
    LucideLock,
    LucideUser,
    LucideUserPlus,
    LucideShieldCheck,
    LucideLoaderCircle
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss'
})
export class RegisterPageComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirm = signal('');
  readonly terms = signal(false);
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  onSubmit(event: Event): void {
    event.preventDefault();
    const name = this.name().trim();
    const email = this.email().trim();
    if (!name || !email || !this.password()) {
      this.error.set('Please fill in all the fields above.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      this.error.set('Please enter a valid email address.');
      return;
    }
    if (this.password() !== this.confirm()) {
      this.error.set('Passwords do not match. Please try again.');
      return;
    }
    if (String(this.password()).length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }
    if (!this.terms()) {
      this.error.set('Please accept the terms and conditions.');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.auth.register(name, email, this.password()).subscribe({
      next: (res) => {
        this.loading.set(false);
        const firstName = res.user?.name?.split(' ')[0] || '';
        this.toast.success('Account created', firstName ? `Welcome, ${firstName}!` : 'Welcome to AutoMart!');
        this.router.navigate(['/wishlist']);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const message =
          (err as { error?: { message?: string } })?.error?.message ||
          'Could not create your account. Please try again.';
        this.error.set(message);
      }
    });
  }
}
