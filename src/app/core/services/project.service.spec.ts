import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { environment } from '../../../environments/environment';
import { Project, ProjectRequest } from '../models/project.model';

/**
 * Covers the two read operations with their isLoading cycle, and the three writes.
 *
 * The decisive test is the one on the error path. isLoading is reset through
 * finalize, which fires on completion, on error and on unsubscribe alike.
 * Replacing it with a tap would leave the flag stuck at true after a failed
 * request and the spinner would never stop.
 */
describe('ProjectService', () => {
  let service: ProjectService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/projects`;

  const project: Project = {
    id: 1,
    name: 'TaskFlow',
    description: 'Portfolio project',
    ownerUsername: 'mehdi',
    createdAt: '2026-10-24T15:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProjectService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests the project collection', () => {
    let received: Project[] | undefined;

    service.getMyProjects().subscribe((projects) => (received = projects));

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([project]);

    expect(received).toEqual([project]);
  });

  it('raises isLoading during the request and lowers it on success', () => {
    // The flag is set in the method body, before the observable is subscribed,
    // so it is already true at this point. A caller that never subscribes would
    // leave it stuck, since finalize would never run.
    service.getMyProjects().subscribe();
    expect(service.isLoading()).toBe(true);

    httpMock.expectOne(apiUrl).flush([]);
    expect(service.isLoading()).toBe(false);
  });

  it('lowers isLoading when the request fails', () => {
    // The error callback is mandatory here. Without it the failure surfaces as an
    // unhandled rejection and the test reports the wrong cause.
    service.getMyProjects().subscribe({ error: () => undefined });

    httpMock
      .expectOne(apiUrl)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(service.isLoading()).toBe(false);
  });

  it('requests a single project by its identifier', () => {
    service.getProjectById(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(project);

    expect(service.isLoading()).toBe(false);
  });

  it('posts the payload when creating a project', () => {
    const request: ProjectRequest = { name: 'TaskFlow', description: 'Portfolio project' };

    service.createProject(request).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(project);
  });

  it('puts the payload on the project identifier when updating', () => {
    const request: ProjectRequest = { name: 'TaskFlow renamed' };

    service.updateProject(1, request).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({ ...project, name: 'TaskFlow renamed' });
  });

  it('deletes the project without touching isLoading', () => {
    service.deleteProject(1).subscribe();

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    // Write operations deliberately leave isLoading alone. The calling component
    // drives its own isSubmitting flag so it can disable one button rather than
    // blanking the whole view.
    expect(service.isLoading()).toBe(false);
  });
});
