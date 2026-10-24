import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

/**
 * Covers the three methods that feed the session signals and both exits of logout.
 *
 * The decisive test here is the last one. clearSession is called from the error
 * callback as well as the success callback, so a failed logout still purges the
 * in-memory session. Without that, a user whose logout request fails would stay
 * authenticated client-side while holding a cookie the server has revoked.
 */
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  const apiUrl = `${environment.apiUrl}/auth`;

  const session: AuthResponse = {
    username: 'mehdi',
    email: 'mehdi@example.com',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // clearSession redirects to /login. Without this spy the test would drive a
    // real navigation through the empty route table and fail on a missing route.
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    // Fails the test if a request was issued and never answered. A silent extra
    // request is exactly the kind of regression this suite exists to catch.
    httpMock.verify();
  });

  it('starts with no session', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.username()).toBeNull();
    expect(service.email()).toBeNull();
  });

  it('posts the credentials to the login endpoint', () => {
    const request: LoginRequest = { identifier: 'mehdi', password: 'secret' };

    service.login(request).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(session);
  });

  it('stores the session returned by login', () => {
    service.login({ identifier: 'mehdi', password: 'secret' }).subscribe();
    httpMock.expectOne(`${apiUrl}/login`).flush(session);

    expect(service.username()).toBe('mehdi');
    expect(service.email()).toBe('mehdi@example.com');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('posts the payload to the register endpoint', () => {
    const request: RegisterRequest = {
      username: 'mehdi',
      email: 'mehdi@example.com',
      password: 'secret',
    };

    service.register(request).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(session);
  });

  it('stores the session returned by register', () => {
    service
      .register({ username: 'mehdi', email: 'mehdi@example.com', password: 'secret' })
      .subscribe();
    httpMock.expectOne(`${apiUrl}/register`).flush(session);

    expect(service.username()).toBe('mehdi');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('refreshes with an empty body and stores the new session', () => {
    service.refresh().subscribe();

    const req = httpMock.expectOne(`${apiUrl}/refresh`);
    expect(req.request.method).toBe('POST');
    // The refresh token travels in the HttpOnly cookie, so the body carries nothing.
    expect(req.request.body).toEqual({});
    req.flush(session);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('clears the session and redirects when logout succeeds', () => {
    service.login({ identifier: 'mehdi', password: 'secret' }).subscribe();
    httpMock.expectOne(`${apiUrl}/login`).flush(session);

    service.logout();
    httpMock.expectOne(`${apiUrl}/logout`).flush({});

    expect(service.username()).toBeNull();
    expect(service.email()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('clears the session and redirects even when logout fails', () => {
    service.login({ identifier: 'mehdi', password: 'secret' }).subscribe();
    httpMock.expectOne(`${apiUrl}/login`).flush(session);

    service.logout();
    httpMock
      .expectOne(`${apiUrl}/logout`)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    // The server-side revocation failed, so the only safe assumption is that the
    // local session is no longer trustworthy. Dropping it is deliberate.
    expect(service.username()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
