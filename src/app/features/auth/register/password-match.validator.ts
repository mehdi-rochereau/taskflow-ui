// src/app/features/auth/register/password-match.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom group-level validator that checks whether `password` and `confirmPassword` match.
 * Applies `{ passwordMismatch: true }` directly on the `confirmPassword` control
 * so that `mat-error` can display the error message via `getFieldErrors`.
 * Clears the error when passwords match.
 *
 * Extracted from `RegisterComponent` so it can be unit tested on its own, without
 * pulling in Angular Material, the router and `AuthService` for what is a pure function.
 * It stays inside the register feature rather than in `shared/utils/` because it
 * hardcodes the `password` and `confirmPassword` control names and is therefore
 * not reusable as is.
 *
 * @returns A `ValidatorFn` to be applied at the `FormGroup` level
 */
export function passwordMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;

    if (password !== confirm) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    // Clears the mismatch error once the fields match again. The hasError guard
    // matters: two empty fields are equal, and clearing unconditionally would
    // wipe the required error set by the control's own validator.
    const confirmControl = group.get('confirmPassword');
    if (confirmControl?.hasError('passwordMismatch')) {
      confirmControl.setErrors(null);
    }

    return null;
  };
}
