import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../features/auth/services/auth.service';
import { AdminAuthService } from '../features/admin/services/admin-auth.service';

/** Attaches the logged-in user's or admin's JWT to API requests as a Bearer token. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Admin routes use the admin token
  if (req.url.includes('/admin/')) {
    const adminAuth = inject(AdminAuthService);
    const token = adminAuth.isAuthenticated()
      ? localStorage.getItem('ayracars-admin-token')
      : null;
    if (token && !req.headers.has('Authorization')) {
      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      }));
    }
    return next(req);
  }

  // All other routes use the user token
  const auth = inject(AuthService);
  const token = auth.token();
  if (token && !req.headers.has('Authorization')) {
    return next(req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }));
  }
  return next(req);
};
