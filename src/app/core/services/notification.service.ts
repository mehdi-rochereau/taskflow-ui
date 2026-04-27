import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Service responsible for displaying user-facing notifications via Angular Material snackbars.
 *
 * Wraps `MatSnackBar` to provide a consistent notification API across the application.
 * Two severity levels are supported — success and error — each with distinct
 * styling and duration.
 *
 * CSS classes `snack-success` and `snack-error` are defined in `styles.scss`
 * and apply Material 3 theme colors to the snackbar container.
 *
 * @example
 * // Inject and use in a component or interceptor
 * private readonly notificationService = inject(NotificationService);
 * this.notificationService.success('Project created successfully');
 * this.notificationService.error('Failed to load projects');
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Displays a success notification for 3 seconds.
   * Styled with the `snack-success` CSS class (primary color).
   *
   * @param message - The message to display
   */
  success(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['snack-success'],
    });
  }

  /**
   * Displays an error notification for 5 seconds.
   * Styled with the `snack-error` CSS class (error color).
   *
   * @param message - The message to display
   */
  error(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['snack-error'],
    });
  }
}
