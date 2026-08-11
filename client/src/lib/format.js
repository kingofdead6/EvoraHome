/**
 * Locale helpers. French is the primary language of this site and every string
 * the customer reads is French, so these are the only number formats used.
 */

const NBSP = ' ';

/**
 * Prices render exactly as `139 000.00 DA`: a space as thousands separator, a
 * dot before the two decimals, and the DA suffix. The separator and the space
 * before DA are non-breaking, so a six-digit price never wraps mid-number at
 * 360px.
 *
 * Every price on the storefront and in the admin goes through this. There is no
 * second place that formats a number as currency.
 */
export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return `0${NBSP}DA`;

  const [whole, decimals] = Math.abs(n).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const sign = n < 0 ? '-' : '';

  return `${sign}${grouped}.${decimals}${NBSP}DA`;
}

/** Price without decimals, for dense admin tables where the .00 is noise. */
export function formatPriceShort(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return `0${NBSP}DA`;
  const grouped = Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${n < 0 ? '-' : ''}${grouped}${NBSP}DA`;
}

/** `120 x 80 x 45 cm` from a dimensions object. */
export function formatDimensions(d) {
  if (!d) return null;
  const parts = [d.largeur, d.profondeur, d.hauteur].filter((v) => v !== null && v !== undefined && v !== '');
  if (!parts.length) return null;
  return `${parts.join(`${NBSP}x${NBSP}`)} ${d.unite || 'cm'}`;
}

/** `11 août 2026` */
export function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

/** `11/08/2026 à 14:32` for admin order tables. */
export function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const date = new Intl.DateTimeFormat('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  const time = new Intl.DateTimeFormat('fr-DZ', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
  return `${date} à ${time}`;
}

/**
 * Algerian mobile numbers as `05 40 87 03 82`. Accepts the local 0-prefixed
 * form and the +213 form, since customers type both.
 */
export function formatPhone(raw) {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('213')) digits = `0${digits.slice(3)}`;
  if (digits.length !== 10) return raw;
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
}

/** Digits-only international form for tel: and wa.me links. */
export function toInternational(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('213')) return digits;
  if (digits.startsWith('0')) return `213${digits.slice(1)}`;
  return `213${digits}`;
}
