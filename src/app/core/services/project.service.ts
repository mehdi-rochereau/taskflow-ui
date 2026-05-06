import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, ProjectRequest } from '../models/project.model';

/**
 * Service responsible for managing projects via the TaskFlow API.
 *
 * Handles all HTTP operations on the `/api/projects` endpoint.
 * Exposes a readonly `isLoading` Signal that components can use
 * to display a loading indicator during GET requests.
 *
 * Note: `isLoading` is only set for read operations (`getMyProjects`, `getProjectById`).
 * Write operations (create, update, delete) are managed via `isSubmitting` in the
 * calling component to allow finer-grained UI feedback.
 *
 * @see ProjectListComponent
 * @see ProjectDetailComponent
 * @see ProjectResolver
 */
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  private readonly _isLoading = signal<boolean>(false);

  /**
   * Readonly signal indicating whether a GET request is in progress.
   * Set to true at the start of `getMyProjects` and `getProjectById`,
   * and reset to false when the request completes (success or error).
   */
  readonly isLoading = this._isLoading.asReadonly();

  /**
   * Retrieves all projects owned by the authenticated user.
   * Sets `isLoading` to true for the duration of the request.
   *
   * @returns Observable emitting an array of projects
   */
  getMyProjects(): Observable<Project[]> {
    this._isLoading.set(true);
    return this.http.get<Project[]>(this.apiUrl).pipe(finalize(() => this._isLoading.set(false)));
  }

  /**
   * Retrieves a single project by its identifier.
   * Sets `isLoading` to true for the duration of the request.
   * Used by `ProjectResolver` to load project data before route activation.
   *
   * @param id - The project identifier
   * @returns Observable emitting the requested project
   */
  getProjectById(id: number): Observable<Project> {
    this._isLoading.set(true);
    return this.http
      .get<Project>(`${this.apiUrl}/${id}`)
      .pipe(finalize(() => this._isLoading.set(false)));
  }

  /**
   * Creates a new project for the authenticated user.
   *
   * @param request - The project creation payload
   * @returns Observable emitting the created project
   */
  createProject(request: ProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, request);
  }

  /**
   * Updates an existing project by its identifier.
   * Only the project owner can perform this operation.
   *
   * @param id - The project identifier
   * @param request - The project update payload
   * @returns Observable emitting the updated project
   */
  updateProject(id: number, request: ProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Permanently deletes a project by its identifier.
   * Only the project owner can perform this operation.
   *
   * @param id - The project identifier
   * @returns Observable that completes when the project is deleted
   */
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
