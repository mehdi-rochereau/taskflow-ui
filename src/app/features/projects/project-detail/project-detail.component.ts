import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DatePipe } from '@angular/common';
import { Project } from '../../../core/models/project.model';
import { Task, TaskStatus, TaskPriority } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { TaskStatusPipe } from '../../../shared/pipes/task-status-pipe';
import { TaskPriorityPipe } from '../../../shared/pipes/task-priority-pipe';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

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
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  isLoading = this.taskService.isLoading;

  displayedColumns = ['title', 'status', 'priority', 'assignee', 'dueDate'];

  readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  readonly priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  selectedStatus = signal<TaskStatus | null>(null);
  selectedPriority = signal<TaskPriority | null>(null);

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
