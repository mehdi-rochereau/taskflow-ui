import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe],
  templateUrl: './project-header.component.html',
  styleUrl: './project-header.component.scss',
})
export class ProjectHeaderComponent {
  @Input({ required: true }) project!: Project;
  @Input() isSubmitting = false;

  @Output() createTask = new EventEmitter<void>();
}
