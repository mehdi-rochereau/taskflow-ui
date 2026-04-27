import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { TaskStatusPipe } from '../../../shared/pipes/task-status-pipe';
import { TaskPriorityPipe } from '../../../shared/pipes/task-priority-pipe';

/**
 * Dumb component providing status and priority filter selects for the task list.
 *
 * Receives the current filter values via `@Input()` and emits changes
 * via `@Output()` to the parent `ProjectDetailComponent`, which handles
 * the API call and URL query parameter update.
 *
 * Filter priority rule (enforced by the API): if both status and priority
 * are set, only status is applied server-side.
 *
 * Uses `OnPush` change detection — only re-renders when `@Input()` references change.
 *
 * @see ProjectDetailComponent
 * @see TaskService
 */
@Component({
  selector: 'app-task-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSelectModule, MatFormFieldModule, TaskStatusPipe, TaskPriorityPipe],
  templateUrl: './task-filters.component.html',
  styleUrl: './task-filters.component.scss',
})
export class TaskFiltersComponent {
  /** Currently active status filter, or null if no filter is applied. */
  @Input() selectedStatus: TaskStatus | null = null;

  /** Currently active priority filter, or null if no filter is applied. */
  @Input() selectedPriority: TaskPriority | null = null;

  /** Emitted when the user changes the status filter. Null clears the filter. */
  @Output() statusChange = new EventEmitter<TaskStatus | null>();

  /** Emitted when the user changes the priority filter. Null clears the filter. */
  @Output() priorityChange = new EventEmitter<TaskPriority | null>();

  /** All available task statuses for the status select options. */
  readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  /** All available task priorities for the priority select options. */
  readonly priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
}
