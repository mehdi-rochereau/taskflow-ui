import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error-interceptor';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';

/**
 * Covers the status codes this interceptor speaks for, and above all the ones
 * it must stay silent on.
 *
 * The decisive test is the one on 401. That status belongs to authInterceptor,
 * which refreshes the token and replays the request without the user ever
 * seeing anything. A notification here would surface an error the user is not
 * meant to know about, and that conflict already reached production once.
 */
describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  const url = `${environment.apiUrl}/projects`;

  // Stubbed rather than real, because NotificationService wraps MatSnackBar and
  // would pull the Material overlay into a test that has nothing to do with it.
  const notification = { error: vi.fn() };

  beforeEach(() => {
    notification.error.mockClear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notification },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('notifies and rethrows on a server error', () => {
    let status: number | undefined;

    http.get(url).subscribe({ error: (err) => (status = err.status) });
    httpMock.expectOne(url).flush('Boom', { status: 500, statusText: 'Internal Server Error' });

    expect(notification.error).toHaveBeenCalledWith('An unexpected server error occurred');
    // The error still reaches the caller, so a component can react on top of
    // the global notification rather than instead of it.
    expect(status).toBe(500);
  });

  it('notifies and rethrows when the rate limit is exceeded', () => {
    let status: number | undefined;

    http.get(url).subscribe({ error: (err) => (status = err.status) });
    httpMock.expectOne(url).flush('Slow down', { status: 429, statusText: 'Too Many Requests' });

    expect(notification.error).toHaveBeenCalledWith('Too many requests. Please try again later.');
    expect(status).toBe(429);
  });

  it('stays silent on an unauthorized response', () => {
    http.get(url).subscribe({ error: () => undefined });
    httpMock.expectOne(url).flush('', { status: 401, statusText: 'Unauthorized' });

    expect(notification.error).not.toHaveBeenCalled();
  });

  it('stays silent on a not found response', () => {
    http.get(url).subscribe({ error: () => undefined });
    httpMock.expectOne(url).flush('', { status: 404, statusText: 'Not Found' });

    expect(notification.error).not.toHaveBeenCalled();
  });

  it('passes a successful response through untouched', () => {
    let body: unknown;

    http.get(url).subscribe((response) => (body = response));
    httpMock.expectOne(url).flush([{ id: 1 }]);

    expect(body).toEqual([{ id: 1 }]);
    expect(notification.error).not.toHaveBeenCalled();
  });
});
