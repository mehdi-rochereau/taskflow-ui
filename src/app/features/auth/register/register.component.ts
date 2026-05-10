import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/models/api-error.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RegisterRequest } from '../../../core/models/auth.model';
import { MatIcon } from '@angular/material/icon';
import { getFieldErrors } from '../../../shared/utils/form-errors';

/**
 * Custom group-level validator that checks whether `password` and `confirmPassword` match.
 * Applies `{ passwordMismatch: true }` directly on the `confirmPassword` control
 * so that `mat-error` can display the error message via `getFieldErrors`.
 * Clears the error when passwords match.
 *
 * @returns A `ValidatorFn` to be applied at the `FormGroup` level
 */
function passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;

    if (password !== confirm) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // Retire l'erreur si les mots de passe correspondent
    const confirmControl = group.get('confirmPassword');
    if (confirmControl?.hasError('passwordMismatch')) {
      confirmControl.setErrors(null);
    }

    return null;
  };
}

/**
 * Component handling new user registration via the register form.
 *
 * Displays a reactive form with username, email, password and confirm password fields.
 * Validates fields client-side using Angular validators and a custom password match validator.
 * Server-side validation errors are applied field-by-field via `setErrors({ serverError })`.
 * On successful registration, redirects to `/projects`.
 *
 * Uses Angular Signals for `isLoading`, `globalError`, `showPassword` and `showConfirmPassword`
 * to ensure automatic DOM updates without manual change detection.
 *
 * Uses a custom `passwordMatchValidator` at group level to compare password fields.
 * The error is applied directly on `confirmPassword` control for `mat-error` compatibility.
 *
 * @see AuthService
 * @see getFieldErrors
 * @see LoginComponent
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIcon,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Reactive form with username, email, password and confirm password fields. */
  form: FormGroup = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator() },
  );

  /** Signal — true while the registration request is in progress. Disables the submit button. */
  isLoading = signal(false);

  /** Signal — global error message for non-field errors. Null when no error. */
  globalError = signal<string | null>(null);

  /** Signal — controls password field visibility. */
  showPassword = signal(false);

  /** Signal — controls confirm password field visibility. */
  showConfirmPassword = signal(false);

  /** True if passwords do not match and confirm field has been touched. */
  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') && !!this.form.get('confirmPassword')?.touched;
  }

  /**
   * Handles form submission.
   * Marks all fields as touched to trigger validation display,
   * then submits the registration request if the form is valid.
   *
   * On API validation errors — applies server-side messages to form controls.
   * On global errors — updates the `globalError` Signal.
   */
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.globalError.set(null);

    const request: RegisterRequest = {
      username: this.form.value.username,
      email: this.form.value.email,
      password: this.form.value.password,
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const apiError = err.error as ApiError;

        if (apiError.errors) {
          Object.keys(apiError.errors).forEach((field) => {
            const control = this.form.get(field);
            if (control) {
              control.setErrors({ serverError: apiError.errors![field][0] });
            }
          });
        } else {
          this.globalError.set(apiError.message ?? 'An unexpected error occurred');
        }
      },
    });
  }

  /**
   * Returns all validation error messages for a given form field.
   *
   * @param field - The form control name
   * @returns Array of error messages, empty if no errors or field not touched
   */
  getFieldErrors(field: string): string[] {
    return getFieldErrors(this.form.get(field));
  }
}
