import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe, NgClass } from '@angular/common';
import { Project } from '../../../core/models/project.model';
import { Task, TaskStatus, TaskPriority } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { TaskStatusPipe } from '../../../shared/pipes/task-status-pipe';
import { TaskPriorityPipe } from '../../../shared/pipes/task-priority-pipe';
import {
  TaskFormDialogComponent,
  TaskDialogData,
} from '../task-form-dialog/task-form-dialog.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    DatePipe,
    TaskStatusPipe,
    TaskPriorityPipe,
    MatProgressSpinner,
    NgClass,
    RouterLink,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  isLoading = this.taskService.isLoading;

  displayedColumns = ['title', 'status', 'priority', 'assignee', 'dueDate', 'actions'];

  readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  readonly priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  selectedStatus = signal<TaskStatus | null>(null);
  selectedPriority = signal<TaskPriority | null>(null);
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

  loadTasks(projectId: number): void {
    const status = this.selectedStatus() ?? undefined;
    const priority = this.selectedPriority() ?? undefined;

    this.taskService.getTasksByProject(projectId, status, priority).subscribe({
      next: (data) => this.tasks.set(data),
      error: (err) => console.error(err),
    });
  }

  onStatusChange(status: TaskStatus | null): void {
    this.selectedStatus.set(status);
    this.updateQueryParams();
    this.loadTasks(this.project()!.id);
  }

  onPriorityChange(priority: TaskPriority | null): void {
    this.selectedPriority.set(priority);
    this.updateQueryParams();
    this.loadTasks(this.project()!.id);
  }

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
          error: (err) => {
            this.notificationService.error('Failed to create task');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

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
          error: (err) => {
            this.notificationService.error('Failed to update task');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

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
          error: (err) => {
            this.notificationService.error('Failed to delete task');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

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
