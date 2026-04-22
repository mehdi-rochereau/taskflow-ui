import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { Project } from '../../../core/models/project.model';
import { Task } from '../../../core/models/task.model';
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
  private readonly taskService = inject(TaskService);

  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  isLoading = this.taskService.isLoading;

  displayedColumns = ['title', 'status', 'priority', 'assignee', 'dueDate'];

  ngOnInit(): void {
    const data = this.route.snapshot.data['project'] as Project;
    this.project.set(data);
    this.loadTasks(data.id);
  }

  loadTasks(projectId: number): void {
    this.taskService.getTasksByProject(projectId).subscribe({
      next: (data) => this.tasks.set(data),
      error: (err) => console.log(err),
    });
  }
}
