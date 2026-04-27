import { HttpInterceptorFn } from '@angular/common/http';

/**
 * HTTP interceptor that adds `withCredentials: true` to every outgoing request.
 *
 * This is required for the browser to automatically include HttpOnly cookies
 * (`jwt` and `refreshToken`) in cross-origin requests to the TaskFlow API.
 *
 * Must be registered first in the interceptor chain in `app.config.ts`
 * to ensure credentials are attached before other interceptors process the request.
 *
 * @see AuthInterceptor
 * @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req.clone({ withCredentials: true }));
};
