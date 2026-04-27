import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP interceptor responsible for silent JWT token refresh on 401 responses.
 *
 * When a protected endpoint returns `401 Unauthorized`, this interceptor
 * automatically attempts to refresh the JWT token via `POST /api/auth/refresh`.
 * If the refresh succeeds, the original request is retried transparently.
 * If the refresh fails, the user is logged out and redirected to `/login`.
 *
 * Auth endpoints (`/auth`) are excluded from this behavior to avoid
 * infinite refresh loops on login failures or invalid refresh tokens.
 *
 * Flow:
 * 1. Request fails with 401
 * 2. If URL does not include `/auth` → call `AuthService.refresh()`
 * 3. On refresh success → retry the original request via `switchMap`
 * 4. On refresh failure → call `AuthService.logout()` and rethrow the error
 *
 * The `refreshToken` HttpOnly cookie is sent automatically by the browser
 * via `CredentialsInterceptor` — no manual token handling is required here.
 *
 * @see CredentialsInterceptor
 * @see AuthService
 * @see ErrorInterceptor
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 && !req.url.includes('/auth')) {
        return authService.refresh().pipe(
          switchMap(() => next(req)),
          catchError((refreshErr) => {
            authService.logout();
            return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
