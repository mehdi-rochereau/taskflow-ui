import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, TaskRequest, TaskStatus, TaskPriority } from '../models/task.model';

/**
 * Service responsible for managing tasks via the TaskFlow API.
 *
 * Handles all HTTP operations on the `/api/projects/{projectId}/tasks` endpoints.
 * Exposes a readonly `isLoading` Signal that components can use
 * to display a loading indicator during GET requests.
 *
 * Note: `isLoading` is only set for read operations (`getTasksByProject`, `getTaskById`).
 * Write operations (create, update, delete) are managed via `isSubmitting` in the
 * calling component to allow finer-grained UI feedback.
 *
 * Filter priority rule: if both `status` and `priority` are provided,
 * only `status` is sent to the API — matching the server-side behavior.
 *
 * @see ProjectDetailComponent
 * @see ProjectListComponent
 * @see TaskTableComponent
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  private readonly _isLoading = signal<boolean>(false);

  /**
   * Readonly signal indicating whether a GET request is in progress.
   * Set to true at the start of `getTasksByProject` and `getTaskById`,
   * and reset to false when the request completes (success or error).
   */
  readonly isLoading = this._isLoading.asReadonly();

  /**
   * Retrieves all tasks for a given project, with optional filtering.
   * Sets `isLoading` to true for the duration of the request.
   *
   * Filter priority: if both `status` and `priority` are provided,
   * only `status` is applied — matching the API behavior.
   *
   * @param projectId - The project identifier
   * @param status - Optional status filter (TODO, IN_PROGRESS, DONE)
   * @param priority - Optional priority filter (LOW, MEDIUM, HIGH) — ignored if status is set
   * @returns Observable emitting an array of tasks
   */
  getTasksByProject(
    projectId: number,
    status?: TaskStatus,
    priority?: TaskPriority,
  ): Observable<Task[]> {
    this._isLoading.set(true);

    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (priority && !status) params = params.set('priority', priority);

    return this.http
      .get<Task[]>(`${this.apiUrl}/${projectId}/tasks`, { params })
      .pipe(finalize(() => this._isLoading.set(false)));
  }

  /**
   * Creates a new task in the given project.
   * Only the project owner can perform this operation.
   *
   * @param projectId - The project identifier
   * @param request - The task creation payload
   * @returns Observable emitting the created task
   */
  createTask(projectId: number, request: TaskRequest): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${projectId}/tasks`, request);
  }

  /**
   * Updates an existing task in the given project.
   * Only the project owner can perform this operation.
   *
   * @param projectId - The project identifier
   * @param id - The task identifier
   * @param request - The task update payload
   * @returns Observable emitting the updated task
   */
  updateTask(projectId: number, id: number, request: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${projectId}/tasks/${id}`, request);
  }

  /**
   * Permanently deletes a task from the given project.
   * Only the project owner can perform this operation.
   *
   * @param projectId - The project identifier
   * @param id - The task identifier
   * @returns Observable that completes when the task is deleted
   */
  deleteTask(projectId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/tasks/${id}`);
  }
}
