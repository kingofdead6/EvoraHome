/**
 * Accent-stripping slug. "Consoles & Miroirs" becomes "consoles-miroirs",
 * "Canapé d'angle La Conner" becomes "canape-d-angle-la-conner".
 *
 * Product and category URLs are built from this, so it must stay stable: a
 * change here breaks every link the client has shared on Instagram.
 */
export function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default slugify;
