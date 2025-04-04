import { ValidationErrors, AbstractControl } from '@angular/forms';

export function OneCheckedDirective(
  c: AbstractControl
): ValidationErrors | null {
  if (Object.values(c.value).every((v) => v === false)) {
    // No checked
    return { oneChecked: true };
  }

  return null; // No errors
}