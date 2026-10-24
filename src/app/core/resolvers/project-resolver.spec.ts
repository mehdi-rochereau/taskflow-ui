import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  provideRouter,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { projectResolver } from './project-resolver';
import { Project } from '../models/project.model';
import { environment } from '../../../environments/environment';

/**
 * Covers the identifier validation and both redirection paths.
 *
 * Four of these tests exist because the previous guard was isNaN alone, which
 * let a missing, empty, zero or fractional identifier reach the API. Number()
 * is lenient in ways isNaN does not reveal, and the resolver now rejects those
 * cases before any request is issued.
 */
describe('projectResolver', () => {
  let httpMock: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  const apiUrl = `${environment.apiUrl}/projects`;
  const state = {} as RouterStateSnapshot;

  const project: Project = {
    id: 1,
    name: 'TaskFlow',
    description: null,
    ownerUsername: 'mehdi',
    createdAt: '2026-10-24T15:00:00Z',
  };

  // Passing null builds a route with no id parameter at all, which is the case
  // Number(null) used to turn into a valid-looking zero.
  const routeWith = (id: string | null) =>
    ({ paramMap: convertToParamMap(id === null ? {} : { id }) }) as ActivatedRouteSnapshot;

  const run = (id: string | null) =>
    TestBed.runInInjectionContext(
      () => projectResolver(routeWith(id), state) as Observable<Project>,
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });

    httpMock = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Asserts the resolver redirected and completed without emitting a project. */
  const expectRedirection = (result: Observable<Project>) => {
    let emitted = false;
    let completed = false;

    result.subscribe({ next: () => (emitted = true), complete: () => (completed = true) });

    // EMPTY completes without a value, which cancels the navigation instead of
    // letting the component render with undefined route data.
    expect(emitted).toBe(false);
    expect(completed).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/projects']);
  };

  it('resolves the project for a valid identifier', () => {
    let resolved: Project | undefined;

    run('1').subscribe((value) => (resolved = value));
    httpMock.expectOne(`${apiUrl}/1`).flush(project);

    expect(resolved).toEqual(project);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('redirects without calling the API when the identifier is not a number', () => {
    expectRedirection(run('abc'));
  });

  it('redirects without calling the API when the identifier is missing', () => {
    expectRedirection(run(null));
  });

  it('redirects without calling the API when the identifier is fractional', () => {
    expectRedirection(run('1.5'));
  });

  it('redirects without calling the API when the identifier is zero', () => {
    expectRedirection(run('0'));
  });

  it('redirects when the API rejects the request', () => {
    const result = run('1');
    let emitted = false;
    let completed = false;

    result.subscribe({ next: () => (emitted = true), complete: () => (completed = true) });
    httpMock.expectOne(`${apiUrl}/1`).flush('', { status: 404, statusText: 'Not Found' });

    expect(emitted).toBe(false);
    expect(completed).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/projects']);
  });
});
