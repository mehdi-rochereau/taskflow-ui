import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

/**
 * Route guard that protects authenticated routes.
 *
 * Allows navigation if the user is already authenticated (`isAuthenticated` Signal is true).
 * On page reload, `isAuthenticated` resets to false — the guard then attempts a silent
 * token refresh via `POST /api/auth/refresh` to restore the session from the
 * `refreshToken` HttpOnly cookie.
 *
 * Behavior:
 * - `isAuthenticated()` is true → allow navigation immediately
 * - `isAuthenticated()` is false → attempt silent refresh
 *   - Refresh succeeds → allow navigation and restore session state
 *   - Refresh fails → redirect to `/login`
 *
 * Note: frequent page reloads may trigger the server-side rate limit on `/api/auth/refresh`.
 * See `taskflow-api` configuration for rate limit settings.
 *
 * @see AuthService
 * @see AuthInterceptor
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return authService.refresh().pipe(
    map(() => true),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    }),
  );
};
