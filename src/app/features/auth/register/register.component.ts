import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  private readonly cdr = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  isLoading = false;
  globalError: string | null = null;

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isLoading = true;
    this.globalError = null;

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
        this.isLoading = false;
        const apiError = err.error as ApiError;

        if (apiError.errors) {
          Object.keys(apiError.errors).forEach((field) => {
            const control = this.form.get(field);
            if (control) {
              control.setErrors({ serverError: apiError.errors![field][0] });
            }
          });
        } else {
          this.globalError = apiError.message ?? 'An unexpected error occurred';
        }

        this.cdr.detectChanges();
      },
    });
  }

  getFieldErrors(field: string): string[] {
    return getFieldErrors(this.form.get(field));
  }
}
