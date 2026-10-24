import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { LoginComponent } from './login.component';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../../../core/models/auth.model';

/**
 * Covers the wiring between the login form, its template and AuthService.
 *
 * The form is driven through Material harnesses rather than by setting control
 * values directly, so the bindings in the template are part of what is under
 * test. A spec that calls form.setValue bypasses the very thing a component
 * test exists to verify.
 */
describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let loader: HarnessLoader;
  let httpMock: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  const loginUrl = `${environment.apiUrl}/auth/login`;
  const session: AuthResponse = { username: 'mehdi', email: 'mehdi@example.com' };

  /** Fills both fields and submits, returning the submit button harness. */
  const submitWith = async (identifier: string, password: string) => {
    const [identifierField, passwordField] = await loader.getAllHarnesses(MatInputHarness);
    await identifierField.setValue(identifier);
    await passwordField.setValue(password);

    const submit = await loader.getHarness(MatButtonHarness.with({ text: 'Sign in' }));
    await submit.click();
    return submit;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    // The real resolver is registered by provideAppInitializer in app.config.ts,
    // which TestBed does not run. Registering it here reproduces production
    // behaviour, where every svgIcon becomes a request for a file under icons/.
    TestBed.inject(MatIconRegistry).addSvgIconResolver((name) =>
      TestBed.inject(DomSanitizer).bypassSecurityTrustResourceUrl(`icons/${name}.svg`),
    );

    fixture = TestBed.createComponent(LoginComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  afterEach(() => {
    // Drained rather than asserted. Icon requests are a side effect of rendering
    // Material icons and carry nothing these tests care about, but leaving them
    // outstanding would make verify() fail for the wrong reason.
    // match() already removes these from the set verify() inspects, so the
    // flush is only there for fidelity. It is skipped when the request was
    // cancelled: a mat-icon destroyed by a re-render unsubscribes from the
    // registry, which cancels the request, and flushing a cancelled request
    // throws. The exception would then abort the TestBed reset and fail the
    // following test for an unrelated reason.
    httpMock
      .match((req) => req.url.endsWith('.svg'))
      .forEach((req) => {
        if (!req.cancelled) req.flush('<svg></svg>');
      });
    httpMock.verify();
  });

  it('renders an empty form', async () => {
    const [identifier, password] = await loader.getAllHarnesses(MatInputHarness);

    expect(await identifier.getValue()).toBe('');
    expect(await password.getValue()).toBe('');
  });

  it('shows the required errors and calls nothing when the form is empty', async () => {
    const submit = await loader.getHarness(MatButtonHarness.with({ text: 'Sign in' }));
    await submit.click();

    // markAllAsTouched is what makes the mat-error blocks appear, since their
    // condition in the template requires the control to be both invalid and
    // touched. Without it a user who submits straight away sees nothing.
    expect(fixture.nativeElement.querySelectorAll('mat-error').length).toBe(2);

    // The absence of a login request is proven by verify() in the afterEach.
    expect(navigate).not.toHaveBeenCalled();
  });

  it('posts the credentials and navigates to the projects page on success', async () => {
    await submitWith('mehdi', 'secret');

    const req = httpMock.expectOne(loginUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ identifier: 'mehdi', password: 'secret' });
    req.flush(session);

    expect(navigate).toHaveBeenCalledWith(['/projects']);
  });

  it('displays the message returned by the API on failure', async () => {
    await submitWith('mehdi', 'wrong');

    httpMock
      .expectOne(loginUrl)
      .flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error-message').textContent).toContain(
      'Invalid credentials',
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it('falls back to a generic message when the error carries no body', async () => {
    await submitWith('mehdi', 'secret');

    // A 503 from nginx during a deployment has an empty body, so err.error is
    // null. Reading message off it used to throw inside the error callback,
    // which left the form silent with nothing to explain the failure.
    httpMock.expectOne(loginUrl).flush(null, { status: 503, statusText: 'Service Unavailable' });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.error-message').textContent).toContain(
      'An unexpected error occurred',
    );
  });

  it('disables the submit button while the request is in flight', async () => {
    const submit = await submitWith('mehdi', 'secret');

    expect(await submit.isDisabled()).toBe(true);

    httpMock.expectOne(loginUrl).flush(session);
  });
});
