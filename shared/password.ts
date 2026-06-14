export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_REQUIREMENTS_HINT =
  'Mindestens 8 Zeichen, mit Buchstaben, Zahlen und Sonderzeichen.';

const HAS_LETTER = /\p{L}/u;
const HAS_NUMBER = /\p{N}/u;
const HAS_SPECIAL = /[^\p{L}\p{N}]/u;

export type PasswordValidationError =
  | 'too_short'
  | 'too_long'
  | 'missing_letter'
  | 'missing_number'
  | 'missing_special';

export function validatePassword(password: string): PasswordValidationError | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return 'too_short';
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return 'too_long';
  }
  if (!HAS_LETTER.test(password)) {
    return 'missing_letter';
  }
  if (!HAS_NUMBER.test(password)) {
    return 'missing_number';
  }
  if (!HAS_SPECIAL.test(password)) {
    return 'missing_special';
  }
  return null;
}

export function passwordValidationMessage(error: PasswordValidationError): string {
  switch (error) {
    case 'too_short':
      return 'Das Passwort muss mindestens 8 Zeichen lang sein.';
    case 'too_long':
      return 'Das Passwort darf höchstens 128 Zeichen lang sein.';
    case 'missing_letter':
      return 'Das Passwort muss mindestens einen Buchstaben enthalten.';
    case 'missing_number':
      return 'Das Passwort muss mindestens eine Zahl enthalten.';
    case 'missing_special':
      return 'Das Passwort muss mindestens ein Sonderzeichen enthalten.';
  }
}
