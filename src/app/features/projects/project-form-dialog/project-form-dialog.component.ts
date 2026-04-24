import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Project, ProjectRequest } from '../../../core/models/project.model';
import { getFieldErrors } from '../../../shared/utils/form-errors';

export interface ProjectDialogData {
  project?: Project;
}

@Component({
  selector: 'app-project-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './project-form-dialog.component.html',
  styleUrl: './project-form-dialog.component.scss',
})
export class ProjectFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProjectFormDialogComponent>);
  readonly data = inject<ProjectDialogData>(MAT_DIALOG_DATA);

  readonly isEditMode = !!this.data?.project;

  form: FormGroup = this.fb.group({
    name: [this.data?.project?.name ?? '', [Validators.required, Validators.maxLength(100)]],
    description: [this.data?.project?.description ?? '', Validators.maxLength(500)],
  });

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const request: ProjectRequest = {
      name: this.form.value.name,
      description: this.form.value.description || undefined,
    };

    this.dialogRef.close(request);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getFieldErrors(field: string): string[] {
    return getFieldErrors(this.form.get(field));
  }
}
