import { TaskPriorityPipe } from './task-priority-pipe';
import { TaskPriority } from '../../core/models/task.model';

describe('TaskPriorityPipe', () => {
  const pipe = new TaskPriorityPipe();

  it('labels LOW', () => {
    expect(pipe.transform('LOW')).toBe('Low');
  });

  it('labels MEDIUM', () => {
    expect(pipe.transform('MEDIUM')).toBe('Medium');
  });

  it('labels HIGH', () => {
    expect(pipe.transform('HIGH')).toBe('High');
  });

  it('falls back to the raw value for an unknown priority', () => {
    // Même raison que pour TaskStatusPipe, voir le commentaire correspondant.
    expect(pipe.transform('CRITICAL' as TaskPriority)).toBe('CRITICAL');
  });
});
