import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE } from '@config/api';

const TOKEN_KEY = 'automart-user-token';
const USER_KEY = 'automart-user';

export interface AuthUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly isAuthenticated = signal(this.hasToken());
  readonly user = signal<AuthUser | null>(this.readUser());

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/login`, { email, password }).pipe(
      tap((res) => this.persist(res))
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/register`, { name, email, password }).pipe(
      tap((res) => this.persist(res))
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
    this.user.set(null);
    this.isAuthenticated.set(false);
  }

  token(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY);
  }

  private persist(res: AuthResponse): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_KEY, res.token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    this.user.set(res.user);
    this.isAuthenticated.set(true);
  }

  private hasToken(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
