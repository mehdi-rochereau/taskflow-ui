import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth-interceptor';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.model';

/**
 * Covers the silent refresh, the most delicate mechanism in this application.
 *
 * The real AuthService is used rather than a stub, so the refresh and the logout
 * it triggers go through HttpTestingController like any other request. That is
 * deliberate: the point of this suite is to exercise the real chain, and a
 * stubbed service would hide the fact that a failed refresh issues a third
 * request of its own.
 */
describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  const projectsUrl = `${environment.apiUrl}/projects`;
  const refreshUrl = `${environment.apiUrl}/auth/refresh`;
  const logoutUrl = `${environment.apiUrl}/auth/logout`;
  const loginUrl = `${environment.apiUrl}/auth/login`;

  const session: AuthResponse = { username: 'mehdi', email: 'mehdi@example.com' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    // Carries most of the weight in this file. Several tests assert that no
    // refresh was attempted, and the only proof of that is the absence of an
    // outstanding request here.
    httpMock.verify();
  });

  it('passes a successful response through untouched', () => {
    let body: unknown;

    http.get(projectsUrl).subscribe((response) => (body = response));
    httpMock.expectOne(projectsUrl).flush([{ id: 1 }]);

    expect(body).toEqual([{ id: 1 }]);
  });

  it('does not attempt a refresh on an error other than 401', () => {
    let status: number | undefined;

    http.get(projectsUrl).subscribe({ error: (err) => (status = err.status) });
    httpMock.expectOne(projectsUrl).flush('', { status: 403, statusText: 'Forbidden' });

    expect(status).toBe(403);
  });

  it('refreshes the token and replays the original request on 401', () => {
    let body: unknown;

    http.get(projectsUrl).subscribe((response) => (body = response));
    httpMock.expectOne(projectsUrl).flush('', { status: 401, statusText: 'Unauthorized' });

    // The refresh token travels in the HttpOnly cookie, so this call carries no
    // credentials of its own.
    httpMock.expectOne(refreshUrl).flush(session);

    // The replay is the same request object, reissued through next().
    httpMock.expectOne(projectsUrl).flush([{ id: 1 }]);

    expect(body).toEqual([{ id: 1 }]);
  });

  it('does not refresh when the failing request is an auth endpoint', () => {
    let status: number | undefined;

    http.post(loginUrl, {}).subscribe({ error: (err) => (status = err.status) });
    httpMock.expectOne(loginUrl).flush('', { status: 401, statusText: 'Unauthorized' });

    // Refreshing here would loop: a rejected login would trigger a refresh that
    // fails for the same reason, which would trigger another login attempt.
    expect(status).toBe(401);
  });

  it('logs out and rethrows when the refresh itself fails', () => {
    let status: number | undefined;

    http.get(projectsUrl).subscribe({ error: (err) => (status = err.status) });
    httpMock.expectOne(projectsUrl).flush('', { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne(refreshUrl).flush('', { status: 401, statusText: 'Unauthorized' });

    // logout() issues a request of its own, so this failure path produces three
    // requests in total. Omitting this expectation would fail the afterEach.
    httpMock.expectOne(logoutUrl).flush({});

    expect(status).toBe(401);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('refreshes for a path that merely contains the auth segment', () => {
    const authorsUrl = `${environment.apiUrl}/projects/authors`;
    let body: unknown;

    http.get(authorsUrl).subscribe((response) => (body = response));
    httpMock.expectOne(authorsUrl).flush('', { status: 401, statusText: 'Unauthorized' });

    // Regression guard. The exclusion used to be req.url.includes('/auth'),
    // which matched anywhere in the URL and silently skipped the refresh for
    // this endpoint, leaving the user on a 401 that nothing retried. The
    // exclusion is now anchored to the auth base path.
    httpMock.expectOne(refreshUrl).flush(session);
    httpMock.expectOne(authorsUrl).flush([{ id: 1 }]);

    expect(body).toEqual([{ id: 1 }]);
  });
});
