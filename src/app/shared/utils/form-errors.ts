import { AbstractControl } from '@angular/forms';

/**
 * Returns all validation error messages for a given form control.
 * Handles both Angular built-in validators and server-side errors.
 *
 * @param control - The form control to extract errors from
 * @returns Array of error messages, empty if no errors or control not touched
 */
export function getFieldErrors(control: AbstractControl | null): string[] {
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
