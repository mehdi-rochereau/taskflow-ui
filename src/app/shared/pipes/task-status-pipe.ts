import { Pipe, PipeTransform } from '@angular/core';
import { TaskStatus } from '../../core/models/task.model';

/**
 * Pipe that transforms a `TaskStatus` enum value into a human-readable string.
 *
 * Used in templates to display task status labels instead of raw enum values.
 * Falls back to the raw value if an unknown status is provided.
 *
 * @example
 * {{ task.status | taskStatus }}
 * // 'TODO'        → 'To do'
 * // 'IN_PROGRESS' → 'In progress'
 * // 'DONE'        → 'Done'
 */
@Pipe({
  name: 'taskStatus',
  standalone: true,
})
export class TaskStatusPipe implements PipeTransform {
  /**
   * Transforms a `TaskStatus` value into its display label.
   *
   * @param value - The task status enum value
   * @returns A human-readable status label
   */
  transform(value: TaskStatus): string {
    switch (value) {
      case 'TODO':
        return 'To do';
      case 'IN_PROGRESS':
        return 'In progress';
      case 'DONE':
        return 'Done';
      default:
        return value;
    }
  }
}
