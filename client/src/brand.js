/**
 * Brand constants and UI copy.
 *
 * French is the primary and default language of this site. Every user-facing
 * string lives here or in a component's own copy block, never inlined in the
 * middle of layout code, so that a locale layer can be dropped in later without
 * touching markup. There is deliberately no i18n library in this pass.
 *
 * The contact block below is a build-time fallback. At runtime the Settings
 * record from the API wins, so the client can change their phone number from
 * the admin without a redeploy.
 */

export const brand = {
  name: 'Evora Home',
  wordmark: 'Evora Home',
  tagline: "L'élégance prend forme chez vous",
  descriptor: 'Meuble et article de décoration',
};

export const contact = {
  telephone: '0540870382',
  telephone2: '',
  whatsapp: '213540870382',
  adresse: 'El Khroub 25100, Constantine',
  ville: 'El Khroub',
  wilaya: 'Constantine',
  codePostal: '25100',
  horaires: 'Samedi au jeudi, 9h00 à 18h00. Vendredi fermé.',
  instagram: 'evorahomealgeria',
  facebook: '',
};

export const seo = {
  title: "Evora Home | Meuble et décoration - El Khroub, Constantine",
  description:
    "Salons, chambres, tables et décoration à El Khroub, Constantine. Livraison dans les 58 wilayas, paiement à la livraison.",
};

/**
 * Pre-filled WhatsApp message for the "Commander via WhatsApp" fallback on the
 * product page. Many customers will never use the cart, so this path carries
 * the product reference itself rather than sending them to a blank chat.
 */
export function whatsappProductLink(product, phone = contact.whatsapp) {
  const lines = [
    `Bonjour Evora Home,`,
    `Je souhaite commander : ${product?.nom || ''}`,
    product?.ref ? `Réf : ${product.ref}` : null,
  ].filter(Boolean);
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function whatsappLink(message, phone = contact.whatsapp) {
  return `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export const instagramUrl = (handle = contact.instagram) => `https://instagram.com/${handle}`;
