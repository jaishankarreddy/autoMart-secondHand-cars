import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideEye,
  LucideEyeOff,
  LucideMail,
  LucideLock,
  LucideUser,
  LucideUserPlus,
  LucideShieldCheck
} from '@lucide/angular';
import { RippleDirective } from '../../cars/directives/ripple.directive';

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
    LucideShieldCheck
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss'
})
export class RegisterPageComponent {
  private readonly router = inject(Router);

  readonly name = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly confirm = signal('');
  readonly terms = signal(false);
  readonly showPassword = signal(false);
  readonly error = signal('');

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.name().trim() || !this.email().trim() || !this.password()) {
      this.error.set('Please fill in all the fields above.');
      return;
    }
    if (this.password() !== this.confirm()) {
      this.error.set('Passwords do not match. Please try again.');
      return;
    }
    if (!this.terms()) {
      this.error.set('Please accept the terms and conditions.');
      return;
    }
    this.error.set('');
    this.router.navigate(['/auth/login']);
  }
}
