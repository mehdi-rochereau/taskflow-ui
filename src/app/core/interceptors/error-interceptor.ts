import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

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
