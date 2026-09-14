import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { AuthService } from '../features/auth/services/auth.service';
import { API_BASE } from '@config/api';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly ids = signal<string[]>([]);

  readonly wishlist = this.ids;

  constructor() {
    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.load();
      } else {
        this.ids.set([]);
      }
    });
  }

  has(id: string): boolean {
    return this.ids().includes(id);
  }

  count(): number {
    return this.ids().length;
  }

  load(): void {
    this.http.get<{ wishlist: string[] }>(`${API_BASE}/wishlist`).subscribe({
      next: (res) => this.ids.set(res.wishlist ?? []),
      error: (err) => console.error('[Wishlist] load failed:', err)
    });
  }

  toggle(id: string, opts?: { silent?: boolean }): boolean {
    if (!this.auth.isAuthenticated()) {
      if (!opts?.silent) {
        this.toast.info('Please log in', 'Log in to save vehicles to your wishlist.');
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: this.router.url }
        });
      }
      return false;
    }

    const added = !this.has(id);

    // Optimistic update
    this.ids.update((list) => (added ? [...list, id] : list.filter((x) => x !== id)));

    const request = added
      ? this.http.post<{ wishlist: string[] }>(`${API_BASE}/wishlist/${id}`, {})
      : this.http.delete<{ wishlist: string[] }>(`${API_BASE}/wishlist/${id}`);

    request.subscribe({
      next: (res) => {
        // Sync with server response
        if (res?.wishlist) {
          this.ids.set(res.wishlist);
        }
      },
      error: (err) => {
        // Rollback optimistic update
        this.ids.update((list) => (added ? list.filter((x) => x !== id) : [...list, id]));
        const message = err?.error?.message || 'Could not update wishlist. Please try again.';
        if (!opts?.silent) {
          this.toast.error('Wishlist error', message);
        }
        console.error('[Wishlist] toggle failed:', err);
      }
    });

    if (!opts?.silent) {
      if (added) this.toast.success('Added to wishlist', 'Saved to your wishlist.');
      else this.toast.info('Removed from wishlist', 'The vehicle was removed from your wishlist.');
    }
    return added;
  }
}
