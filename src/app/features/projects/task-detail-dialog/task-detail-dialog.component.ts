import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe, NgClass } from '@angular/common';
import { Task } from '../../../core/models/task.model';
import { TaskStatusPipe } from '../../../shared/pipes/task-status-pipe';
import { TaskPriorityPipe } from '../../../shared/pipes/task-priority-pipe';

/**
 * Data contract for `TaskDetailDialogComponent`.
 */
export interface TaskDetailDialogData {
  task: Task;
}

/**
 * Dumb dialog component displaying the full details of a task in read-only mode.
 *
 * Displays all task fields: title, status, priority, assignee, due date,
 * creation date and description. Status and priority are rendered as
 * color-coded chips using `TaskStatusPipe` and `TaskPriorityPipe`.
 *
 * Opened from `TaskTableComponent` on row click or visibility icon click.
 * Uses `OnPush` change detection — data is injected once and never changes.
 *
 * @see TaskTableComponent
 * @see ProjectDetailComponent
 */
@Component({
  selector: 'app-task-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  /** Dialog data injected via `MAT_DIALOG_DATA`. Contains the task to display. */
  readonly data = inject<TaskDetailDialogData>(MAT_DIALOG_DATA);

  /** The task to display — extracted from dialog data for template convenience. */
  readonly task = this.data.task;

  /** Closes the dialog. */
  close(): void {
    this.dialogRef.close();
  }
}
