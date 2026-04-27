import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Project, ProjectRequest } from '../../../core/models/project.model';
import { getFieldErrors } from '../../../shared/utils/form-errors';

/**
 * Data contract for `ProjectFormDialogComponent`.
 * Pass a `project` to open in edit mode, or omit it for creation mode.
 */
export interface ProjectDialogData {
  project?: Project;
}

/**
 * Dialog component for creating or editing a project.
 *
 * Operates in two modes determined by the presence of `data.project`:
 * - **Creation mode** — empty form, closes with a `ProjectRequest` on submit
 * - **Edit mode** — form pre-filled with existing project data, closes with updated `ProjectRequest`
 *
 * On cancel, closes without returning any data.
 * The calling component is responsible for making the API call with the returned data.
 *
 * @see ProjectListComponent
 * @see ProjectRequest
 * @see getFieldErrors
 */
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

  /** Dialog data injected via `MAT_DIALOG_DATA`. Contains an optional existing project. */
  readonly data = inject<ProjectDialogData>(MAT_DIALOG_DATA);

  /** True if a project was passed as dialog data — enables edit mode. */
  readonly isEditMode = !!this.data?.project;

  /** Reactive form pre-filled with existing project data in edit mode. */
  form: FormGroup = this.fb.group({
    name: [this.data?.project?.name ?? '', [Validators.required, Validators.maxLength(100)]],
    description: [this.data?.project?.description ?? '', Validators.maxLength(500)],
  });

  /**
   * Handles form submission.
   * Marks all fields as touched to trigger validation display.
   * Closes the dialog with the `ProjectRequest` payload on success.
   * Empty description is converted to `undefined` to match the API contract.
   */
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const request: ProjectRequest = {
      name: this.form.value.name,
      description: this.form.value.description || undefined,
    };

    this.dialogRef.close(request);
  }

  /** Closes the dialog without returning any data. */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * Returns all validation error messages for a given form field.
   * Delegates to the shared `getFieldErrors` utility.
   *
   * @param field - The form control name
   * @returns Array of error messages, empty if no errors or field not touched
   */
  getFieldErrors(field: string): string[] {
    return getFieldErrors(this.form.get(field));
  }
}
