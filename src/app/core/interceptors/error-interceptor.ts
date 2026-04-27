import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/**
 * HTTP interceptor that handles global server-side error responses.
 *
 * Intercepts HTTP error responses and displays user-facing notifications
 * for specific status codes:
 * - `500 Internal Server Error` — generic server error message
 * - `429 Too Many Requests` — rate limit exceeded message
 *
 * All errors are re-thrown after handling so that individual components
 * can still react to them if needed.
 *
 * Note: `401 Unauthorized` is intentionally not handled here —
 * it is managed exclusively by `AuthInterceptor` via silent token refresh.
 *
 * @see AuthInterceptor
 * @see NotificationService
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 500) {
        notificationService.error('An unexpected server error occurred');
      }

      if (err.status === 429) {
        notificationService.error('Too many requests. Please try again later.');
      }

      return throwError(() => err);
    }),
  );
};
