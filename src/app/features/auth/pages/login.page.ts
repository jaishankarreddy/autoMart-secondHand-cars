import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import {
  LucideEye,
  LucideEyeOff,
  LucideMail,
  LucideLock,
  LucideSmartphone,
  LucideLogIn,
  LucideShieldCheck,
  LucideLoaderCircle
} from '@lucide/angular';
import { RippleDirective } from '../../cars/directives/ripple.directive';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../../services/toast.service';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

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
    LucideShieldCheck,
    LucideLoaderCircle
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly email = signal('');
  readonly password = signal('');
  readonly remember = signal(false);
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

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
      next: (res) => {
        this.loading.set(false);
        const name = res.user?.name?.split(' ')[0] || '';
        this.toast.success('Welcome back', name ? `Signed in as ${name}.` : 'You are now signed in.');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || '/wishlist');
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const message =
          (err as { error?: { message?: string } })?.error?.message ||
          'Sign in failed. Check your email and password.';
        this.error.set(message);
      }
    });
  }
}
