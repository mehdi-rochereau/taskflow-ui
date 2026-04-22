import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Task, TaskRequest, TaskStatus, TaskPriority } from '../../../core/models/task.model';

export interface TaskDialogData {
  task?: Task;
  projectId: number;
}

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
    MatDatepickerModule
  ],
  templateUrl: './task-form-dialog.component.html',
  styleUrl: './task-form-dialog.component.scss',
})
export class TaskFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);
  readonly data = inject<TaskDialogData>(MAT_DIALOG_DATA);

  readonly isEditMode = !!this.data?.task;

  readonly statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];
  readonly priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  form: FormGroup = this.fb.group({
    title: [this.data?.task?.title ?? '', [Validators.required, Validators.maxLength(200)]],
    description: [this.data?.task?.description ?? '', Validators.maxLength(1000)],
    status: [this.data?.task?.status ?? 'TODO', Validators.required],
    priority: [this.data?.task?.priority ?? 'MEDIUM', Validators.required],
    dueDate: [this.data?.task?.dueDate ?? null],
    assigneeId: [null],
  });

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
      assigneeId: formValue.assigneeId || undefined,
    };

    this.dialogRef.close(request);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getFieldErrors(field: string): string[] {
    const control = this.form.get(field);
    if (!control || !control.errors || !control.touched) return [];

    const messages: string[] = [];
    const errors = control.errors;

    if (errors['required']) messages.push('This field is required');
    if (errors['maxlength'])
      messages.push(`Maximum ${errors['maxlength'].requiredLength} characters`);
    if (errors['serverError']) messages.push(errors['serverError']);

    return messages;
  }
}
