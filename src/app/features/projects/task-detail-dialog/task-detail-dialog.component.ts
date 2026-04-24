import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe, NgClass } from '@angular/common';
import { Task } from '../../../core/models/task.model';
import { TaskStatusPipe } from '../../../shared/pipes/task-status-pipe';
import { TaskPriorityPipe } from '../../../shared/pipes/task-priority-pipe';

export interface TaskDetailDialogData {
  task: Task;
}

@Component({
  selector: 'app-task-detail-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDividerModule,
    DatePipe,
    NgClass,
    TaskStatusPipe,
    TaskPriorityPipe,
  ],
  templateUrl: './task-detail-dialog.component.html',
  styleUrl: './task-detail-dialog.component.scss',
})
export class TaskDetailDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<TaskDetailDialogComponent>);
  readonly data = inject<TaskDetailDialogData>(MAT_DIALOG_DATA);

  readonly task = this.data.task;

  close(): void {
    this.dialogRef.close();
  }
}
