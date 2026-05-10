import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Project } from '../../../core/models/project.model';
import { Task, TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import {
  TaskDialogData,
  TaskFormDialogComponent,
} from '../task-form-dialog/task-form-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';
import {
  TaskDetailDialogComponent,
  TaskDetailDialogData,
} from '../task-detail-dialog/task-detail-dialog.component';
import { ProjectHeaderComponent } from '../project-header/project-header.component';
import { TaskFiltersComponent } from '../task-filters/task-filters.component';
import { TaskTableComponent } from '../task-table/task-table.component';

/**
 * Smart component displaying the detail of a project and its associated tasks.
 *
 * Responsibilities:
 * - Receiving the project from the route data (pre-loaded by `ProjectResolver`)
 * - Loading and filtering tasks via `TaskService`
 * - Persisting active filters in the URL as query parameters
 * - Opening create, edit, detail and delete dialogs for tasks
 * - Delegating display to three dumb child components:
 *   `ProjectHeaderComponent`, `TaskFiltersComponent`, `TaskTableComponent`
 *
 * Uses `isLoading` from `TaskService` for the task list spinner,
 * and a local `isSubmitting` Signal for CRUD operation feedback.
 *
 * @see ProjectResolver
 * @see ProjectHeaderComponent
 * @see TaskFiltersComponent
 * @see TaskTableComponent
 */
@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [ProjectHeaderComponent, TaskFiltersComponent, TaskTableComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);

  /** Signal holding the current project, pre-loaded by `ProjectResolver`. */
  project = signal<Project | null>(null);

  /** Signal holding the list of tasks for the current project. */
  tasks = signal<Task[]>([]);

  /** Readonly signal from `TaskService` — true while a task list request is in progress. */
  isLoading = this.taskService.isLoading;

  /** Signal holding the currently active status filter, or null if no filter is applied. */
  selectedStatus = signal<TaskStatus | null>(null);

  /** Signal holding the currently active priority filter, or null if no filter is applied. */
  selectedPriority = signal<TaskPriority | null>(null);

  /** Local signal — true while a create, update or delete task operation is in progress. */
  isSubmitting = signal<boolean>(false);

  ngOnInit(): void {
    const data = this.route.snapshot.data['project'] as Project;
    this.project.set(data);

    const status = this.route.snapshot.queryParamMap.get('status') as TaskStatus | null;
    const priority = this.route.snapshot.queryParamMap.get('priority') as TaskPriority | null;

    this.selectedStatus.set(status);
    this.selectedPriority.set(priority);

    this.loadTasks(data.id);
  }

  /**
   * Loads tasks for the given project, applying the current status and priority filters.
   * Displays an error notification if the request fails.
   *
   * @param projectId - The project identifier
   */
  loadTasks(projectId: number): void {
    const status = this.selectedStatus() ?? undefined;
    const priority = this.selectedPriority() ?? undefined;

    this.taskService.getTasksByProject(projectId, status, priority).subscribe({
      next: (data) => this.tasks.set(data),
      error: () => this.notificationService.error('Failed to load tasks'),
    });
  }

  /**
   * Handles status filter change from `TaskFiltersComponent`.
   * Updates the selected status, syncs the URL and reloads tasks.
   *
   * @param status - The new status filter value, or null to clear the filter
   */
  onStatusChange(status: TaskStatus | null): void {
    this.selectedStatus.set(status);
    this.updateQueryParams();
    this.loadTasks(this.project()!.id);
  }

  /**
   * Handles priority filter change from `TaskFiltersComponent`.
   * Updates the selected priority, syncs the URL and reloads tasks.
   *
   * @param priority - The new priority filter value, or null to clear the filter
   */
  onPriorityChange(priority: TaskPriority | null): void {
    this.selectedPriority.set(priority);
    this.updateQueryParams();
    this.loadTasks(this.project()!.id);
  }

  /**
   * Opens the task creation dialog.
   * On confirmation, creates the task and reloads the task list.
   */
  openCreateTaskDialog(): void {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '600px',
      data: { projectId: this.project()!.id } as TaskDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isSubmitting.set(true);
        this.taskService.createTask(this.project()!.id, result).subscribe({
          next: () => {
            this.notificationService.success('Task created successfully');
            this.loadTasks(this.project()!.id);
            this.isSubmitting.set(false);
          },
          error: () => {
            this.notificationService.error('Failed to create task');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

  /**
   * Opens the task edit dialog pre-filled with the given task data.
   * Stops click propagation to prevent triggering the row click handler.
   * On confirmation, updates the task and reloads the task list.
   *
   * @param event - The click event — propagation is stopped to avoid opening the detail dialog
   * @param task - The task to edit
   */
  openEditTaskDialog(event: Event, task: Task): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '600px',
      data: { task, projectId: this.project()!.id } as TaskDialogData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isSubmitting.set(true);
        this.taskService.updateTask(this.project()!.id, task.id, result).subscribe({
          next: () => {
            this.loadTasks(this.project()!.id);
            this.notificationService.success('Task updated successfully');
            this.isSubmitting.set(false);
          },
          error: () => {
            this.notificationService.error('Failed to update task');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

  /**
   * Opens the task detail dialog displaying all task information in read-only mode.
   * Also triggered by clicking anywhere on the task row.
   *
   * @param task - The task to display
   */
  openTaskDetailDialog(task: Task): void {
    this.dialog.open(TaskDetailDialogComponent, {
      width: '90vw',
      maxWidth: '700px',
      maxHeight: '90vh',
      autoFocus: false,
      data: { task } as TaskDetailDialogData,
    });
  }

  /**
   * Opens a confirmation dialog before deleting the given task.
   * Stops click propagation to prevent triggering the row click handler.
   * On confirmation, deletes the task and reloads the task list.
   *
   * @param event - The click event — propagation is stopped to avoid opening the detail dialog
   * @param task - The task to delete
   */
  deleteTask(event: Event, task: Task): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.title}" ?`,
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isSubmitting.set(true);
        this.taskService.deleteTask(this.project()!.id, task.id).subscribe({
          next: () => {
            this.loadTasks(this.project()!.id);
            this.notificationService.success('Task deleted successfully');
            this.isSubmitting.set(false);
          },
          error: () => {
            this.notificationService.error('Failed to delete task');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

  /**
   * Syncs the active status and priority filters to the URL as query parameters.
   * Null values are removed from the URL.
   * Preserves existing query parameters via `queryParamsHandling: 'merge'`.
   */
  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        status: this.selectedStatus() ?? null,
        priority: this.selectedPriority() ?? null,
      },
      queryParamsHandling: 'merge',
    });
  }
}
