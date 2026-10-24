import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { environment } from '../../../environments/environment';
import { Task, TaskRequest } from '../models/task.model';

/**
 * Covers the four filter combinations of getTasksByProject, the isLoading error
 * path, and the three write operations.
 *
 * The decisive test is the fourth one. When both status and priority are given,
 * only status reaches the API, which mirrors the server-side rule. Dropping the
 * negation in `if (priority && !status)` would send both parameters and the
 * server response would no longer be specified.
 */
describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const tasksUrl = `${environment.apiUrl}/projects/1/tasks`;

  const task: Task = {
    id: 1,
    title: 'Write the service specs',
    description: null,
    status: 'TODO',
    priority: 'HIGH',
    dueDate: null,
    projectId: 1,
    assigneeUsername: null,
    createdAt: '2026-10-24T15:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('sends no query parameter when no filter is given', () => {
    service.getTasksByProject(1).subscribe();

    // Matching on req.url alone ignores the query string, which lets the
    // assertion below be the only thing that decides the outcome.
    const req = httpMock.expectOne((r) => r.url === tasksUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush([task]);
  });

  it('sends only the status parameter when status is given', () => {
    service.getTasksByProject(1, 'TODO').subscribe();

    const req = httpMock.expectOne((r) => r.url === tasksUrl);
    expect(req.request.params.get('status')).toBe('TODO');
    expect(req.request.params.has('priority')).toBe(false);
    req.flush([task]);
  });

  it('sends only the priority parameter when priority alone is given', () => {
    service.getTasksByProject(1, undefined, 'HIGH').subscribe();

    const req = httpMock.expectOne((r) => r.url === tasksUrl);
    expect(req.request.params.get('priority')).toBe('HIGH');
    expect(req.request.params.has('status')).toBe(false);
    req.flush([task]);
  });

  it('drops the priority parameter when both filters are given', () => {
    service.getTasksByProject(1, 'TODO', 'HIGH').subscribe();

    const req = httpMock.expectOne((r) => r.url === tasksUrl);
    expect(req.request.params.get('status')).toBe('TODO');
    expect(req.request.params.has('priority')).toBe(false);
    req.flush([task]);
  });

  it('lowers isLoading when the request fails', () => {
    service.getTasksByProject(1).subscribe({ error: () => undefined });

    httpMock
      .expectOne((r) => r.url === tasksUrl)
      .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(service.isLoading()).toBe(false);
  });

  it('posts the payload when creating a task', () => {
    const request: TaskRequest = {
      title: 'Write the service specs',
      status: 'TODO',
      priority: 'HIGH',
    };

    service.createTask(1, request).subscribe();

    const req = httpMock.expectOne(tasksUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(task);
  });

  it('puts the payload on the task identifier when updating', () => {
    const request: TaskRequest = {
      title: 'Write the service specs',
      status: 'DONE',
      priority: 'HIGH',
    };

    service.updateTask(1, 1, request).subscribe();

    const req = httpMock.expectOne(`${tasksUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({ ...task, status: 'DONE' });
  });

  it('deletes the task by its identifier', () => {
    service.deleteTask(1, 1).subscribe();

    const req = httpMock.expectOne(`${tasksUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
