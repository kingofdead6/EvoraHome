/**
 * Client-side validation.
 *
 * Mirrors the server's rules so the customer sees the problem before the round
 * trip, not instead of it. The server validates independently and is the only
 * thing that decides whether an order is accepted.
 */

/** Normalises 0540870382, +213 540 87 03 82 and 213540870382 to one form. */
export function normalisePhoneClient(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('213')) digits = `0${digits.slice(3)}`;
  return digits;
}

/**
 * Algerian mobile: 10 digits starting 05, 06 or 07.
 *
 * Landlines (0[2-4]...) are deliberately rejected as an ordering contact. The
 * shop confirms every order by phone and a landline that nobody answers during
 * the day loses the sale.
 */
export function isValidPhoneClient(raw) {
  return /^0(5|6|7)\d{8}$/.test(normalisePhoneClient(raw));
}

export function isValidEmail(raw) {
  if (!raw) return true; // email is optional everywhere on this site
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(raw).trim());
}

export function isValidIdentifier(raw) {
  if (!raw?.trim()) return false;
  return isValidPhoneClient(raw) || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(raw).trim());
}
