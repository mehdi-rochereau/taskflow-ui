import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { MatIconRegistry } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DomSanitizer } from '@angular/platform-browser';
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

    // Icons are served as individual SVG files from public/icons/ rather than
    // by the Material Icons font.
    //
    // A resolver rather than twenty-eight addSvgIcon calls: it receives the
    // name requested by <mat-icon> and returns the matching URL, so adding an
    // icon means dropping a file in public/icons/ with nothing to change here.
    //
    // The trade-off of this approach: a name with no matching file fails at
    // runtime with a 404 and an empty icon, where the font showed the name in
    // plain text. Neither is caught at build time.
    //
    // bypassSecurityTrustResourceUrl is required by the registry's signature;
    // every method of MatIconRegistry demands a SafeResourceUrl or SafeHtml.
    // It is safe here because the URL is relative, so it resolves against this
    // origin and never leaves our infrastructure, and because the only variable
    // part is the icon name written in the templates. Should an icon name ever
    // come from the API, it would have to be checked against a known list
    // before being used to build this URL.
    provideAppInitializer(() => {
      const registry = inject(MatIconRegistry);
      const sanitizer = inject(DomSanitizer);

      registry.addSvgIconResolver((name) =>
        sanitizer.bypassSecurityTrustResourceUrl(`icons/${name}.svg`),
      );
    }),
  ],
};
