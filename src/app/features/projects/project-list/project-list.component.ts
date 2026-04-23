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

  projects = signal<Project[]>([]);
  isLoading = this.projectService.isLoading;
  isSubmitting = signal<boolean>(false);
  searchQuery = signal<string>('');

  filteredProjects = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.projects();
    return this.projects().filter((p) => p.name.toLowerCase().includes(query));
  });

  taskCounts = signal<Map<number, number>>(new Map());

  loadTaskCounts(projects: Project[]): void {
    const counts = new Map<number, number>();
    let loaded = 0;

    if (projects.length === 0) {
      this.taskCounts.set(counts);
      return;
    }

    projects.forEach((project) => {
      this.taskService.getTasksByProject(project.id).subscribe({
        next: (tasks) => {
          counts.set(project.id, tasks.length);
          loaded++;
          if (loaded === projects.length) {
            this.taskCounts.set(new Map(counts));
          }
        },
        error: () => {
          counts.set(project.id, 0);
          loaded++;
          if (loaded === projects.length) {
            this.taskCounts.set(new Map(counts));
          }
        },
      });
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getMyProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loadTaskCounts(data);
      },
      error: (err) => console.error(err),
    });
  }

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
          error: (err) => {
            this.notificationService.error('Failed to create project');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

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
          error: (err) => {
            this.notificationService.error('Failed to update project');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

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
          error: (err) => {
            this.notificationService.error('Failed to delete project');
            this.isSubmitting.set(false);
          },
        });
      }
    });
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/projects', id]);
  }
}
