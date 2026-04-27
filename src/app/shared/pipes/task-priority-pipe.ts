import { Pipe, PipeTransform } from '@angular/core';
import { TaskPriority } from '../../core/models/task.model';

/**
 * Pipe that transforms a `TaskPriority` enum value into a human-readable string.
 *
 * Used in templates to display task priority labels instead of raw enum values.
 * Falls back to the raw value if an unknown priority is provided.
 *
 * @example
 * {{ task.priority | taskPriority }}
 * // 'LOW'    → 'Low'
 * // 'MEDIUM' → 'Medium'
 * // 'HIGH'   → 'High'
 */
@Pipe({
  name: 'taskPriority',
  standalone: true,
})
export class TaskPriorityPipe implements PipeTransform {
  /**
   * Transforms a `TaskPriority` value into its display label.
   *
   * @param value - The task priority enum value
   * @returns A human-readable priority label
   */
  transform(value: TaskPriority): string {
    switch (value) {
      case 'LOW':
        return 'Low';
      case 'MEDIUM':
        return 'Medium';
      case 'HIGH':
        return 'High';
      default:
        return value;
    }
  }
}
