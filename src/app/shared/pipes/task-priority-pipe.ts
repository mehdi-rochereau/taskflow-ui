import { Pipe, PipeTransform } from '@angular/core';
import { TaskPriority } from '../../core/models/task.model';

@Pipe({
  name: 'taskPriority',
  standalone: true,
})
export class TaskPriorityPipe implements PipeTransform {
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
