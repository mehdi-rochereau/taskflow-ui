import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/models/api-error.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

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

    this.authService.register(this.form.value).subscribe({
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
    const control = this.form.get(field);
    if (!control || !control.errors || !control.touched) return [];

    const messages: string[] = [];
    const errors = control.errors;

    if (errors['required']) messages.push('This field is required');
    if (errors['minlength'])
      messages.push(`Minimum ${errors['minlength'].requiredLength} characters`);
    if (errors['maxlength'])
      messages.push(`Maximum ${errors['maxlength'].requiredLength} characters`);
    if (errors['email']) messages.push('Invalid email address');
    if (errors['serverError']) messages.push(errors['serverError']);

    return messages;
  }
}
