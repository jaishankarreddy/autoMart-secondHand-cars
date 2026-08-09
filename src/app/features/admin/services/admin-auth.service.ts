import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

const TOKEN_KEY = 'automart-admin-token';
const ADMIN_KEY = 'automart-admin';

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: AdminProfile;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);

  readonly isAuthenticated = signal(this.hasToken());
  readonly admin = signal<AdminProfile | null>(this.readAdmin());

  login(email: string, password: string): Observable<AdminLoginResponse> {
    return this.http
      .post<AdminLoginResponse>('/api/admin/login', { email, password })
      .pipe(
        tap((res) => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(TOKEN_KEY, res.token);
            window.localStorage.setItem(ADMIN_KEY, JSON.stringify(res.admin));
          }
          this.admin.set(res.admin);
          this.isAuthenticated.set(true);
        })
      );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(ADMIN_KEY);
    }
    this.admin.set(null);
    this.isAuthenticated.set(false);
  }

  private hasToken(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage.getItem(TOKEN_KEY);
  }

  private readAdmin(): AdminProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(ADMIN_KEY);
      return raw ? (JSON.parse(raw) as AdminProfile) : null;
    } catch {
      return null;
    }
  }
}
