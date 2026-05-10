import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Task, TaskPriority, TaskRequest, TaskStatus } from '../../../core/models/task.model';
import { getFieldErrors } from '../../../shared/utils/form-errors';

/**
 * Data contract for `TaskFormDialogComponent`.
 * Pass a `task` to open in edit mode, or omit it for creation mode.
 * `projectId` is always required to associate the task with its project.
 */
export interface TaskDialogData {
  task?: Task;
  projectId: number;
}

/**
 * Dialog component for creating or editing a task.
 *
 * Operates in two modes determined by the presence of `data.task`:
 * - **Creation mode** — form pre-filled with default values (TODO, MEDIUM)
 * - **Edit mode** — form pre-filled with existing task data
 *
 * On submit, closes the dialog with a `TaskRequest` payload.
 * The due date is converted from a JavaScript `Date` object to ISO 8601
 * date string format (`YYYY-MM-DD`) as expected by the API.
 * On cancel, closes without returning any data.
 *
 * @see ProjectDetailComponent
 * @see TaskRequest
 * @see getFieldErrors
 */
@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  templateUrl: './task-form-dialog.component.html',
  styleUrl: './task-form-dialog.component.scss',
})
export class TaskFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);

  /** Dialog data injected via `MAT_DIALOG_DATA`. Contains the optional task and project ID. */
  readonly data = inject<TaskDialogData>(MAT_DIALOG_DATA);

  /** True if a task was passed as dialog data — enables edit mode. */
  readonly isEditMode = !!this.data?.task;

  /** All available task statuses for the status select options. */
  readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

  /** All available task priorities for the priority select options. */
  readonly priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  /** Reactive form pre-filled with existing task data in edit mode, or defaults in creation mode. */
  form: FormGroup = this.fb.group({
    title: [this.data?.task?.title ?? '', [Validators.required, Validators.maxLength(200)]],
    description: [this.data?.task?.description ?? '', Validators.maxLength(1000)],
    status: [this.data?.task?.status ?? 'TODO', Validators.required],
    priority: [this.data?.task?.priority ?? 'MEDIUM', Validators.required],
    dueDate: [this.data?.task?.dueDate ?? null],
  });

  /**
   * Handles form submission.
   * Marks all fields as touched to trigger validation display.
   * Converts the due date from a `Date` object to ISO 8601 date string (`YYYY-MM-DD`).
   * Closes the dialog with the `TaskRequest` payload on success.
   */
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const formValue = this.form.value;
    const request: TaskRequest = {
      title: formValue.title,
      description: formValue.description || undefined,
      status: formValue.status,
      priority: formValue.priority,
      dueDate: formValue.dueDate
        ? new Date(formValue.dueDate).toISOString().split('T')[0]
        : undefined,
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
