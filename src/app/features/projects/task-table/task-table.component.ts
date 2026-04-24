import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, NgClass } from '@angular/common';
import { Task } from '../../../core/models/task.model';
import { TaskStatusPipe } from '../../../shared/pipes/task-status-pipe';
import { TaskPriorityPipe } from '../../../shared/pipes/task-priority-pipe';

@Component({
  selector: 'app-task-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    NgClass,
    TaskStatusPipe,
    TaskPriorityPipe,
  ],
  templateUrl: './task-table.component.html',
  styleUrl: './task-table.component.scss',
})
export class TaskTableComponent {
  @Input({ required: true }) tasks: Task[] = [];
  @Input() isLoading = false;

  @Output() view = new EventEmitter<Task>();
  @Output() edit = new EventEmitter<{ event: Event; task: Task }>();
  @Output() delete = new EventEmitter<{ event: Event; task: Task }>();

  readonly allColumns = ['title', 'status', 'priority', 'assignee', 'dueDate', 'actions'];
  readonly mobileColumns = ['title', 'status', 'priority', 'actions'];

  displayedColumns = this.allColumns;

  constructor() {
    this.updateColumns(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateColumns((event.target as Window).innerWidth);
  }

  private updateColumns(width: number): void {
    this.displayedColumns = width < 600 ? this.mobileColumns : this.allColumns;
  }
}
