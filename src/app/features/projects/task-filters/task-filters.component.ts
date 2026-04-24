import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { TaskStatusPipe } from '../../../shared/pipes/task-status-pipe';
import { TaskPriorityPipe } from '../../../shared/pipes/task-priority-pipe';

@Component({
  selector: 'app-task-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatSelectModule, MatFormFieldModule, TaskStatusPipe, TaskPriorityPipe],
  templateUrl: './task-filters.component.html',
  styleUrl: './task-filters.component.scss',
})
export class TaskFiltersComponent {
  @Input() selectedStatus: TaskStatus | null = null;
  @Input() selectedPriority: TaskPriority | null = null;

  @Output() statusChange = new EventEmitter<TaskStatus | null>();
  @Output() priorityChange = new EventEmitter<TaskPriority | null>();

  readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  readonly priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
}
