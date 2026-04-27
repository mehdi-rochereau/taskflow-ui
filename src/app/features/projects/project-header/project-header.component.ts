import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { Project } from '../../../core/models/project.model';

/**
 * Dumb component displaying the header of a project detail page.
 *
 * Displays the project name, owner, creation date and an optional description.
 * Provides a back button navigating to `/projects` and a "New Task" button
 * that emits a `createTask` event to the parent component.
 *
 * Uses `OnPush` change detection — only re-renders when `@Input()` references change.
 *
 * @see ProjectDetailComponent
 */
@Component({
  selector: 'app-project-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe],
  templateUrl: './project-header.component.html',
  styleUrl: './project-header.component.scss',
})
export class ProjectHeaderComponent {
  /** The project to display. Required — throws a compile-time error if not provided. */
  @Input({ required: true }) project!: Project;

  /** True while a task creation or update is in progress — disables the New Task button. */
  @Input() isSubmitting = false;

  /** Emitted when the user clicks the "New Task" button. */
  @Output() createTask = new EventEmitter<void>();
}
