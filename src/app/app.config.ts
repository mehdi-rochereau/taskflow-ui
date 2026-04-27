import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';
import { errorInterceptor } from './core/interceptors/error-interceptor';
import { credentialsInterceptor } from './core/interceptors/credentials-interceptor';

/**
 * Root application configuration for TaskFlow UI.
 *
 * Registers global Angular providers:
 * - `provideRouter` — configures lazy-loaded routes with guards and resolvers
 * - `provideHttpClient` — enables `HttpClient` with a chain of three interceptors:
 *   1. `credentialsInterceptor` — adds `withCredentials: true` to all requests
 *   2. `authInterceptor` — handles 401 responses with silent token refresh
 *   3. `errorInterceptor` — handles 500 and 429 responses with notifications
 * - `provideNativeDateAdapter` — enables native date handling for `MatDatepicker`
 * - `provideBrowserGlobalErrorListeners` — captures unhandled errors in the browser
 *
 * Interceptor order is significant: credentials must be applied first so that
 * cookies are included in all subsequent requests including the refresh call.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([credentialsInterceptor, authInterceptor, errorInterceptor]),
    ),
    provideNativeDateAdapter(),
  ],
};
