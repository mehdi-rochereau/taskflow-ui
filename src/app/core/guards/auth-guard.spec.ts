import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.model';

/**
 * Covers the three exits of the route guard.
 *
 * The guard restores a session after a page reload, where isAuthenticated has
 * reset to false but the refreshToken cookie survived. It returns a UrlTree
 * rather than navigating imperatively, which lets the router cancel the
 * navigation cleanly instead of racing a second one against it.
 */
describe('authGuard', () => {
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  const refreshUrl = `${environment.apiUrl}/auth/refresh`;
  const session: AuthResponse = { username: 'mehdi', email: 'mehdi@example.com' };

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  // The guard calls inject(), which only resolves inside an injection context.
  // Calling it directly would throw NG0203 rather than run the guard.
  const run = () => TestBed.runInInjectionContext(() => authGuard(route, state));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('allows navigation immediately when the session is already known', () => {
    authService.isAuthenticated.set(true);

    // Returns the raw boolean, not an observable, so there is nothing to
    // subscribe to and no request to flush. The afterEach proves the guard did
    // not reach the network.
    expect(run()).toBe(true);
  });

  it('attempts a silent refresh and allows navigation when it succeeds', () => {
    let allowed: boolean | UrlTree | undefined;

    (run() as Observable<boolean | UrlTree>).subscribe((result) => (allowed = result));
    httpMock.expectOne(refreshUrl).flush(session);

    expect(allowed).toBe(true);
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('returns a redirection to the login page when the refresh fails', () => {
    let allowed: boolean | UrlTree | undefined;

    (run() as Observable<boolean | UrlTree>).subscribe((result) => (allowed = result));
    httpMock.expectOne(refreshUrl).flush('', { status: 401, statusText: 'Unauthorized' });

    expect(allowed).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(allowed as UrlTree)).toBe('/login');
  });
});
