import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, TaskRequest, TaskStatus, TaskPriority } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  isLoading = signal<boolean>(false);

  getTasksByProject(
    projectId: number,
    status?: TaskStatus,
    priority?: TaskPriority,
  ): Observable<Task[]> {
    this.isLoading.set(true);

    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (priority && !status) params = params.set('priority', priority);

    return this.http
      .get<Task[]>(`${this.apiUrl}/${projectId}/tasks`, { params })
      .pipe(finalize(() => this.isLoading.set(false)));
  }

  getTaskById(projectId: number, id: number): Observable<Task> {
    this.isLoading.set(true);
    return this.http
      .get<Task>(`${this.apiUrl}/${projectId}/tasks/${id}`)
      .pipe(finalize(() => this.isLoading.set(false)));
  }

  createTask(projectId: number, request: TaskRequest): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${projectId}/tasks`, request);
  }

  updateTask(projectId: number, id: number, request: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${projectId}/tasks/${id}`, request);
  }

  deleteTask(projectId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/tasks/${id}`);
  }
}
