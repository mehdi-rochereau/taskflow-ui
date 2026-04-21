import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, ProjectRequest } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  isLoading = signal<boolean>(false);

  getMyProjects(): Observable<Project[]> {
    this.isLoading.set(true);
    return this.http.get<Project[]>(this.apiUrl).pipe(finalize(() => this.isLoading.set(false)));
  }

  getProjectById(id: number): Observable<Project> {
    this.isLoading.set(true);
    return this.http
      .get<Project>(`${this.apiUrl}/${id}`)
      .pipe(finalize(() => this.isLoading.set(false)));
  }

  createProject(request: ProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, request);
  }

  updateProject(id: number, request: ProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, request);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
