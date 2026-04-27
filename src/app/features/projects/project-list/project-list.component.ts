import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import {
  ProjectFormDialogComponent,
  ProjectDialogData,
} from '../project-form-dialog/project-form-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';
import { MatFormField, MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { MatProgressBar } from '@angular/material/progress-bar';
import { forkJoin } from 'rxjs';

/**
 * Smart component displaying the list of projects owned by the authenticated user.
 *
 * Responsibilities:
 * - Loading and displaying projects via `ProjectService`
 * - Loading task counts per project via `TaskService` using `forkJoin`
 * - Client-side project filtering via a reactive search query Signal
 * - Opening create, edit and delete dialogs
 * - Displaying a task progress bar per project card
 *
 * Uses `isLoading` from `ProjectService` for the initial load spinner,
 * and a local `isSubmitting` Signal for CRUD operation feedback.
 */
@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    DatePipe,
    MatFormField,
    MatLabel,
    MatInput,
    MatSuffix,
    MatProgressBar,
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly taskService = inject(TaskService);

  /** Signal holding the full list of projects returned by the API. */
  projects = signal<Project[]>([]);

  /** Readonly signal from `ProjectService` — true while `getMyProjects` is in progress. */
  isLoading = this.projectService.isLoading;

  /** Local signal — true while a create, update or delete operation is in progress. */
  isSubmitting = signal<boolean>(false);

  /** Signal holding the current search query entered by the user. */
  searchQuery = signal<string>('');

  /**
   * Computed signal that filters `projects` by name based on `searchQuery`.
   * Returns all projects when the query is empty.
   */
  filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.projects();
    return this.projects().filter((p) => p.name.toLowerCase().includes(query));
  });

  /**
   * Signal holding a map of project ID to task array.
   * Populated by `loadTaskCounts` after projects are loaded.
   */
  tasksByProject = signal<Map<number, Task[]>>(new Map());

  ngOnInit(): void {
    this.loadProjects();
  }

  /**
   * Loads all projects and triggers task count loading.
   * Displays an error notification if the request fails.
   */
  loadProjects(): void {
    this.projectService.getMyProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loadTaskCounts(data);
      },
      error: () => {
        this.notificationService.error('Failed to load projects');
      },
    });
  }

  /**
   * Loads tasks for all projects in parallel using `forkJoin`.
   * Populates `tasksByProject` once all requests complete.
   * Silently ignores errors to avoid blocking the project list display.
   *
   * @param projects - The list of projects to load tasks for
   */
  loadTaskCounts(projects: Project[]): void {
    if (projects.length === 0) {
      this.tasksByProject.set(new Map());
      return;
    }

    const requests = projects.map((p) => this.taskService.getTasksByProject(p.id));

    forkJoin(requests).subscribe({
      next: (results) => {
        const map = new Map<number, Task[]>();
        projects.forEach((p, i) => map.set(p.id, results[i]));
        this.tasksByProject.set(map);
      },
      error: () => {},
    });
  }

  /**
   * Returns the total number of tasks for a given project.
   *
   * @param projectId - The project identifier
   * @returns Total task count, or 0 if not yet loaded
   */
  getTaskCount(projectId: number): number {
    return this.tasksByProject().get(projectId)?.length ?? 0;
  }

  /**
   * Returns the number of completed tasks for a given project.
   *
   * @param projectId - The project identifier
   * @returns Count of tasks with status `DONE`, or 0 if not yet loaded
   */
  getDoneCount(projectId: number): number {
    return (
      this.tasksByProject()
        .get(projectId)
        ?.filter((t) => t.status === 'DONE').length ?? 0
    );
  }

  /**
   * Returns the task completion percentage for a given project.
   * Used to drive the `mat-progress-bar` value in the template.
   *
   * @param projectId - The project identifier
   * @returns A number between 0 and 100, or 0 if no tasks exist
   */
  getProgress(projectId: number): number {
    const total = this.getTaskCount(projectId);
    if (total === 0) return 0;
    return (this.getDoneCount(projectId) / total) * 100;
  }

  /**
   * Opens the project creation dialog.
   * On confirmation, creates the project and reloads the list.
   */
  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProjectFormDialogComponent, {
      width: '500px',
      data: {} as ProjectDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isSubmitting.set(true);
        this.projectService.createProject(result).subscribe({
          next: () => {
            this.loadProjects();
            this.notificationService.success('Project created successfully');
            this.isSubmitting.set(false);
          },
          error: () => {
            this.notificationService.error('Failed to create project');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

  /**
   * Opens the project edit dialog pre-filled with the given project data.
   * Stops click propagation to prevent navigation to the project detail.
   * On confirmation, updates the project and reloads the list.
   *
   * @param event - The click event — propagation is stopped to avoid card navigation
   * @param project - The project to edit
   */
  openEditDialog(event: Event, project: Project): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ProjectFormDialogComponent, {
      width: '500px',
      data: { project } as ProjectDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isSubmitting.set(true);
        this.projectService.updateProject(project.id, result).subscribe({
          next: () => {
            this.loadProjects();
            this.notificationService.success('Project updated successfully');
            this.isSubmitting.set(false);
          },
          error: () => {
            this.notificationService.error('Failed to update project');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

  /**
   * Opens a confirmation dialog before deleting the given project.
   * Stops click propagation to prevent navigation to the project detail.
   * On confirmation, deletes the project and reloads the list.
   *
   * @param event - The click event — propagation is stopped to avoid card navigation
   * @param project - The project to delete
   */
  deleteProject(event: Event, project: Project): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Project',
        message: `Are you sure you want to delete "${project.name}" ? This action cannot be undone.`,
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isSubmitting.set(true);
        this.projectService.deleteProject(project.id).subscribe({
          next: () => {
            this.loadProjects();
            this.notificationService.success('Project deleted successfully');
            this.isSubmitting.set(false);
          },
          error: () => {
            this.notificationService.error('Failed to delete project');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

  /**
   * Navigates to the project detail page for the given project ID.
   *
   * @param id - The project identifier
   */
  navigateToDetail(id: number): void {
    this.router.navigate(['/projects', id]);
  }
}
