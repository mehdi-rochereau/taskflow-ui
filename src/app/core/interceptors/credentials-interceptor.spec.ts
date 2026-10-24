import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { credentialsInterceptor } from './credentials-interceptor';
import { environment } from '../../../environments/environment';

/**
 * Covers the single line that carries the whole cookie-based authentication.
 *
 * Without withCredentials the browser omits the HttpOnly jwt and refreshToken
 * cookies on cross-origin calls, and every protected endpoint answers 401 with
 * no visible cause in the application code.
 */
describe('credentialsInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  const url = `${environment.apiUrl}/projects`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([credentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('sets withCredentials on an outgoing request', () => {
    http.get(url).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.withCredentials).toBe(true);
    req.flush([]);
  });

  it('leaves the rest of the request untouched', () => {
    const body = { name: 'TaskFlow' };

    http.post(url, body).subscribe();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.url).toBe(url);
    expect(req.request.body).toEqual(body);
    req.flush({});
  });
});
