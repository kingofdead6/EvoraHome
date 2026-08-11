// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH
// Everything brand-specific lives here. Components, Tailwind, index.html and the
// document head all read from this file. To rebrand a store, edit this file only —
// never the components.
//
// Changing the entire look of the store = editing the three `theme` hex values.
// ─────────────────────────────────────────────────────────────────────────────

export const store = {
  brand: {
    name: "NOVYX",                       // text logo / brand name shown everywhere
    fullName: "NOVYX Mobile",            // used in copyright / formal contexts
    tagline: "Algeria's #1 source for original smartphones. Best prices, fast delivery, cash on delivery.",
    logoText: "NOVYX",                   // text logo fallback (rendered with accent dot)
    logo: "/src/assets/Logo.png",        // optional image logo (favicon source in this demo)
    favicon: "/src/assets/Logo.png",
  },
  niche: {
    type: "general",
    productNoun: "product",
    productNounPlural: "products",
  },
  theme: {
    primary:   "#6C2BD9",   // brand purple — buttons, gradients, glows, primary accents
    secondary: "#8B5CF6",   // brand violet — gradient pair / surfaces / hover states
    accent:    "#22D3EE",   // brand cyan   — highlights, badges, links, the logo dot
  },
  contact: {
    email:    "contact@novyx.dz",
    phone:    "+213 XXX XXX XXX",
    phoneHref: "+213XXXXXXXXX",          // digits-only form used in tel: links
    whatsapp: "213XXXXXXXXX",            // digits-only form used in wa.me links
    address:  "Algeria",
  },
  social: {
    instagram: "",
    facebook:  "",
    tiktok:    "",
  },
  locale: {
    currency:       "DZD",
    currencySymbol: "DA",
    locale:         "fr-DZ",
    lang:           "fr",
  },
  seo: {
    title:       "NovyxMobile",
    description: "Algeria's #1 source for original smartphones. Best prices, fast delivery, cash on delivery.",
    ogImage:     "/src/assets/Logo.png",
  },
};

export default store;
