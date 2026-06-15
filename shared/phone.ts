export const PHONE_MIN_DIGITS = 8;
export const PHONE_MAX_LENGTH = 25;
export const PHONE_DEFAULT_COUNTRY_CODE = '+49';

const NORMALIZED_FORMAT = /^\+[0-9]+$/;
const ALLOWED_INPUT_CHARS = /^[0-9+\s]+$/;

export type PhoneValidationError =
  | 'invalid_chars'
  | 'too_short'
  | 'too_long'
  | 'invalid_format';

function stripWhitespace(value: string): string {
  return value.replace(/\s/g, '');
}

export function normalizePhoneNumber(input: string): string {
  let value = stripWhitespace(input.trim());

  if (value.startsWith('00')) {
    value = '+' + value.slice(2);
  } else if (value.startsWith('+')) {
    // already international
  } else if (value.startsWith('0')) {
    value = PHONE_DEFAULT_COUNTRY_CODE + value.slice(1);
  } else {
    value = PHONE_DEFAULT_COUNTRY_CODE + value;
  }

  return value;
}

export function validatePhoneNumber(
  input: string,
): PhoneValidationError | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return 'too_short';
  }

  if (!ALLOWED_INPUT_CHARS.test(trimmed)) {
    return 'invalid_chars';
  }

  const normalized = normalizePhoneNumber(trimmed);

  if (!NORMALIZED_FORMAT.test(normalized)) {
    return 'invalid_format';
  }

  if (normalized.length > PHONE_MAX_LENGTH) {
    return 'too_long';
  }

  const digitCount = normalized.length - 1;
  if (digitCount < PHONE_MIN_DIGITS) {
    return 'too_short';
  }

  return null;
}

export function phoneValidationMessage(error: PhoneValidationError): string {
  switch (error) {
    case 'invalid_chars':
      return 'Die Telefonnummer darf nur Ziffern, „+“ und Leerzeichen enthalten.';
    case 'too_short':
      return 'Die Telefonnummer muss mindestens 8 Ziffern enthalten.';
    case 'too_long':
      return 'Die Telefonnummer darf höchstens 25 Zeichen lang sein.';
    case 'invalid_format':
      return 'Die Telefonnummer hat ein ungültiges Format.';
  }
}
