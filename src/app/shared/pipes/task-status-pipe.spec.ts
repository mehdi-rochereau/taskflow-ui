import { TaskStatusPipe } from './task-status-pipe';
import { TaskStatus } from '../../core/models/task.model';

describe('TaskStatusPipe', () => {
  const pipe = new TaskStatusPipe();

  it('labels TODO', () => {
    expect(pipe.transform('TODO')).toBe('To do');
  });

  it('labels IN_PROGRESS', () => {
    expect(pipe.transform('IN_PROGRESS')).toBe('In progress');
  });

  it('labels DONE', () => {
    expect(pipe.transform('DONE')).toBe('Done');
  });

  it('falls back to the raw value for an unknown status', () => {
    // Le type TaskStatus interdit cette valeur, le cast force le cas de repli.
    // Il protège contre un statut ajouté côté API sans l'être ici : l'interface
    // afficherait la valeur brute au lieu de planter ou d'afficher du vide.
    expect(pipe.transform('ARCHIVED' as TaskStatus)).toBe('ARCHIVED');
  });
});
