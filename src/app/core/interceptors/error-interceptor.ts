import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401 && !req.url.includes('/auth')) {
        notificationService.error('Session expired, please log in again');
        authService.logout();
      }

      if (err.status === 500) {
        notificationService.error('An unexpected server error occurred');
      }

      return throwError(() => err);
    }),
  );
};
