/**
 * Input validation helpers for Marketio forms.
 */

/** Strip everything except digits and a leading '+' */
export function formatPhoneNumber(input: string): string {
  // Keep leading '+' if present, then only digits
  const hasPlus = input.startsWith("+");
  const digits = input.replace(/\D/g, "");
  if (digits.length === 0) return hasPlus ? "+" : "";

  const raw = hasPlus ? `+${digits}` : digits;

  // Format with spaces: +XXX XX XXX XXXX or similar grouping
  if (hasPlus && digits.length > 3) {
    const cc = digits.slice(0, 3); // country code (up to 3 digits)
    const rest = digits.slice(3);
    // Group remaining digits in chunks of 2-3
    const parts = rest.match(/.{1,3}/g) || [];
    return `+${cc} ${parts.join(" ")}`;
  }

  return raw;
}

/** Extract raw digits from a phone string (ignoring '+') */
function extractDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Valid if 6-15 digits (ITU-T E.164 range) */
export function isValidPhone(phone: string): boolean {
  const digits = extractDigits(phone);
  return digits.length >= 6 && digits.length <= 15;
}

/** Strip characters that aren't letters, digits, hyphens, or spaces; uppercase */
export function sanitizePlate(input: string): string {
  return input.replace(/[^A-Za-z0-9\- ]/g, "").toUpperCase();
}

/** Valid if 4-12 characters, only letters/digits/hyphens/spaces */
export function isValidPlate(plate: string): boolean {
  const trimmed = plate.trim();
  if (trimmed.length < 4 || trimmed.length > 12) return false;
  return /^[A-Za-z0-9\- ]+$/.test(trimmed);
}
