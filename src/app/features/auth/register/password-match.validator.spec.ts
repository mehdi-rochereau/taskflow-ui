// src/app/features/auth/register/password-match.validator.spec.ts
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { passwordMatchValidator } from './password-match.validator';

describe('passwordMatchValidator', () => {
  // Construit le groupe tel que RegisterComponent le déclare, validator compris.
  // FormGroup et FormControl sont instanciés directement, sans FormBuilder,
  // pour que le spec ne dépende d'aucune injection.
  const build = (password: string, confirmPassword: string): FormGroup =>
    new FormGroup(
      {
        password: new FormControl(password, Validators.required),
        confirmPassword: new FormControl(confirmPassword, Validators.required),
      },
      { validators: passwordMatchValidator() },
    );

  it('returns null when both fields match', () => {
    const group = build('Secret123', 'Secret123');

    expect(group.errors).toBeNull();
    expect(group.get('confirmPassword')?.errors).toBeNull();
  });

  it('reports the mismatch at group level', () => {
    const group = build('Secret123', 'Secret124');

    expect(group.errors).toEqual({ passwordMismatch: true });
  });

  it('also applies the error on confirmPassword so mat-error can display it', () => {
    const group = build('Secret123', 'Secret124');

    expect(group.get('confirmPassword')?.errors).toEqual({ passwordMismatch: true });
  });

  it('clears the control error once the fields match again', () => {
    const group = build('Secret123', 'Secret124');
    expect(group.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);

    group.get('confirmPassword')?.setValue('Secret123');

    expect(group.get('confirmPassword')?.errors).toBeNull();
    expect(group.errors).toBeNull();
  });

  it('does not wipe the required error when both fields are empty', () => {
    // Deux champs vides sont égaux, donc le validator passe par sa branche de
    // nettoyage. Le garde hasError l'empêche d'effacer l'erreur required posée
    // par le validator propre au contrôle. C'est le cas que ce test protège.
    const group = build('', '');

    expect(group.get('confirmPassword')?.errors).toEqual({ required: true });
  });
});
