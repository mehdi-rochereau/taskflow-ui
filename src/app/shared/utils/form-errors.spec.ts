import { FormControl, Validators } from '@angular/forms';
import { getFieldErrors } from './form-errors';

describe('getFieldErrors', () => {
  it('returns an empty array when the control is null', () => {
    expect(getFieldErrors(null)).toEqual([]);
  });

  it('returns an empty array when the control has no errors', () => {
    const control = new FormControl('value');
    control.markAsTouched();

    expect(getFieldErrors(control)).toEqual([]);
  });

  it('stays silent while the control is untouched, even when it is invalid', () => {
    const control = new FormControl('', Validators.required);

    // L'erreur existe bel et bien, seul l'affichage est retenu.
    expect(control.errors).toEqual({ required: true });
    expect(getFieldErrors(control)).toEqual([]);
  });

  it('reports a required field', () => {
    const control = new FormControl('', Validators.required);
    control.markAsTouched();

    expect(getFieldErrors(control)).toEqual(['This field is required']);
  });

  it('reports the minimum length with its threshold', () => {
    const control = new FormControl('ab', Validators.minLength(5));
    control.markAsTouched();

    expect(getFieldErrors(control)).toEqual(['Minimum 5 characters']);
  });

  it('reports the maximum length with its threshold', () => {
    const control = new FormControl('abcdef', Validators.maxLength(3));
    control.markAsTouched();

    expect(getFieldErrors(control)).toEqual(['Maximum 3 characters']);
  });

  it('reports an invalid email address', () => {
    const control = new FormControl('not-an-email', Validators.email);
    control.markAsTouched();

    expect(getFieldErrors(control)).toEqual(['Invalid email address']);
  });

  it('passes a server error through unchanged', () => {
    const control = new FormControl('taken');
    control.setErrors({ serverError: 'Username already in use' });
    control.markAsTouched();

    expect(getFieldErrors(control)).toEqual(['Username already in use']);
  });

  it('reports a password mismatch', () => {
    const control = new FormControl('x');
    control.setErrors({ passwordMismatch: true });
    control.markAsTouched();

    expect(getFieldErrors(control)).toEqual(['Passwords do not match']);
  });

  it('accumulates several messages in declaration order', () => {
    const control = new FormControl('');
    control.setErrors({ required: true, email: true });
    control.markAsTouched();

    expect(getFieldErrors(control)).toEqual(['This field is required', 'Invalid email address']);
  });
});
