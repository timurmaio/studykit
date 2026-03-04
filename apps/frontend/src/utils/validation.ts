const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Введите email";
  if (!EMAIL_RE.test(trimmed)) return "Неверный формат email";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Введите пароль";
  if (value.length < MIN_PASSWORD_LENGTH)
    return `Пароль должен быть не менее ${MIN_PASSWORD_LENGTH} символов`;
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `Введите ${fieldName}`;
  return null;
}
