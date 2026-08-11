// Runtime bridge between store.config.js and the DOM.
// - Writes the three brand theme colors into CSS variables (--primary/secondary/
//   accent) so both Tailwind tokens and inline var(--…) styles follow the config.
// - Syncs the document <title>, <html lang> and favicon from the config.
// This keeps store.config.js the single source of truth without introducing a
// separate head-manager library.

import { store } from "./store.config.js";

// "#6C2BD9" -> "108 43 217" (space-separated channels for rgb(... / alpha))
function hexToRgbChannels(hex) {
  let h = String(hex).trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `${r} ${g} ${b}`;
}

export function applyStoreConfig() {
  const root = document.documentElement;

  // Theme → CSS variables (hex + rgb-channel forms)
  root.style.setProperty("--primary", store.theme.primary);
  root.style.setProperty("--secondary", store.theme.secondary);
  root.style.setProperty("--accent", store.theme.accent);
  root.style.setProperty("--primary-rgb", hexToRgbChannels(store.theme.primary));
  root.style.setProperty("--secondary-rgb", hexToRgbChannels(store.theme.secondary));
  root.style.setProperty("--accent-rgb", hexToRgbChannels(store.theme.accent));

  // SEO / head
  if (store.seo?.title) document.title = store.seo.title;
  if (store.locale?.lang) root.setAttribute("lang", store.locale.lang);

  if (store.brand?.favicon) {
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = store.brand.favicon;
  }

  if (store.seo?.description) {
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = store.seo.description;
  }
}

export default applyStoreConfig;
