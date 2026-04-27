import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/models/api-error.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { LoginRequest } from '../../../core/models/auth.model';
import { MatIcon } from '@angular/material/icon';

/**
 * Component handling user authentication via the login form.
 *
 * Displays a reactive form with identifier (username or email) and password fields.
 * On successful login, redirects to `/projects`.
 * On failure, displays the error message returned by the API.
 *
 * Uses Angular Signals for `isLoading` and `errorMessage` to ensure
 * automatic DOM updates without manual change detection.
 *
 * @see AuthService
 * @see RegisterComponent
 */
@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Reactive form with identifier and password fields. */
  form: FormGroup = this.fb.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required],
  });

  /** Signal — true while the login request is in progress. Disables the submit button. */
  isLoading = signal(false);

  /** Signal — error message returned by the API on login failure, or null if no error. */
  errorMessage = signal<string | null>(null);

  /**
   * Handles form submission.
   * Marks all fields as touched to trigger validation display,
   * then submits the login request if the form is valid.
   * Displays the API error message on failure.
   */
  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request: LoginRequest = {
      identifier: this.form.value.identifier,
      password: this.form.value.password,
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const apiError = err.error as ApiError;
        this.errorMessage.set(apiError.message ?? 'An unexpected error occurred');
      },
    });
  }
}
