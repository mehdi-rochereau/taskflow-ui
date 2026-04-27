import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

/**
 * Data contract for `ConfirmDialogComponent`.
 * All labels are optional and fall back to "Delete" and "Cancel".
 */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Generic reusable confirmation dialog.
 *
 * Displays a title, a message and two action buttons.
 * Closes with `true` on confirmation and `false` on cancellation.
 *
 * Used for destructive actions such as deleting a project or a task.
 * The calling component checks the dialog result before proceeding with the API call.
 *
 * Uses `OnPush` change detection — data is injected once and never changes.
 *
 * @example
 * const ref = this.dialog.open(ConfirmDialogComponent, {
 *   data: { title: 'Delete Project', message: 'Are you sure?' }
 * });
 * ref.afterClosed().subscribe(confirmed => { if (confirmed) ... });
 *
 * @see ProjectListComponent
 * @see ProjectDetailComponent
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  /** Dialog data injected via `MAT_DIALOG_DATA`. Contains title, message and optional labels. */
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  /** Closes the dialog with `true` — signals confirmation to the calling component. */
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  /** Closes the dialog with `false` — signals cancellation to the calling component. */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
