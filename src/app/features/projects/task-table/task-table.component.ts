import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, NgClass } from '@angular/common';
import { Task } from '../../../core/models/task.model';
import { TaskStatusPipe } from '../../../shared/pipes/task-status-pipe';
import { TaskPriorityPipe } from '../../../shared/pipes/task-priority-pipe';

/**
 * Dumb component displaying a responsive table of tasks with status and priority chips.
 *
 * Renders a `mat-table` with columns for title, status, priority, assignee,
 * due date and actions (view, edit, delete). On screens narrower than 600px,
 * the assignee and due date columns are hidden automatically via `@HostListener`.
 *
 * Emits events to the parent `ProjectDetailComponent` for all user interactions:
 * - `view` — clicking a row or the visibility icon
 * - `edit` — clicking the edit icon
 * - `delete` — clicking the delete icon
 *
 * Uses `OnPush` change detection — only re-renders when `@Input()` references change.
 *
 * @see ProjectDetailComponent
 * @see TaskStatusPipe
 * @see TaskPriorityPipe
 */
@Component({
  selector: 'app-task-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  /** List of tasks to display. Required — throws a compile-time error if not provided. */
  @Input({ required: true }) tasks: Task[] = [];

  /** True while tasks are being loaded — displays a spinner instead of the table. */
  @Input() isLoading = false;

  /** Emitted when the user clicks a task row or the visibility icon. */
  @Output() view = new EventEmitter<Task>();

  /** Emitted when the user clicks the edit icon. Includes the original click event for stopPropagation. */
  @Output() edit = new EventEmitter<{ event: Event; task: Task }>();

  /** Emitted when the user clicks the delete icon. Includes the original click event for stopPropagation. */
  @Output() delete = new EventEmitter<{ event: Event; task: Task }>();

  /** Full column set displayed on screens wider than 600px. */
  readonly allColumns = ['title', 'status', 'priority', 'assignee', 'dueDate', 'actions'];

  /** Reduced column set displayed on screens narrower than 600px. */
  readonly mobileColumns = ['title', 'status', 'priority', 'actions'];

  /** Currently active column set — updated on window resize. */
  displayedColumns = this.allColumns;

  constructor() {
    this.updateColumns(window.innerWidth);
  }

  /**
   * Listens to window resize events and updates the displayed columns accordingly.
   *
   * @param event - The window resize event
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateColumns((event.target as Window).innerWidth);
  }

  /**
   * Updates `displayedColumns` based on the current window width.
   * Switches to mobile columns below 600px.
   *
   * @param width - The current window inner width in pixels
   */
  private updateColumns(width: number): void {
    this.displayedColumns = width < 600 ? this.mobileColumns : this.allColumns;
  }
}
