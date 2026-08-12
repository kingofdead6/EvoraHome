/**
 * The single place the storefront talks to the API.
 *
 * Every request sends credentials, because the session is an httpOnly cookie
 * rather than a token in localStorage. Errors are normalised into an Error
 * carrying the French message the server sent, so components can render
 * `err.message` directly to the customer without checking shapes.
 */
// VITE_API_URL is what the deployment sets (see HANDOVER.md). The literal is
// the fallback for a build that ships without it, so an unset variable on the
// host degrades to the production API rather than to a broken storefront.
const BASE = import.meta.env.VITE_API_URL || 'https://evorahome.onrender.com/api';

// Request logging is a development aid. It printed every body, including the
// password on /auth/login, into the console of every customer's browser.
const DEBUG = import.meta.env.DEV;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, signal, isForm = false } = {}) {
  const url = `${BASE}${path}`;
  if (DEBUG) console.debug('[API] request', { method, url });

  let response;

  try {
    response = await fetch(url, {
      method,
      credentials: 'include',
      headers: isForm ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (DEBUG) console.error('[API] fetch failed', { method, url, err });
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Connexion impossible. Vérifiez votre connexion internet.', 0);
  }

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    if (DEBUG) console.error('[API] response error', { method, url, status: response.status });
    throw new ApiError(payload?.message || 'Une erreur est survenue', response.status);
  }

  if (DEBUG) console.debug('[API] response success', { method, url, status: response.status });
  return payload;
}

const qs = (params) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  }
  const str = search.toString();
  return str ? `?${str}` : '';
};

export const api = {
  // ── Catalogue ─────────────────────────────────────────────────────────────
  products: (params, signal) => request(`/products${qs(params)}`, { signal }),
  filterOptions: (params, signal) => request(`/products/filters${qs(params)}`, { signal }),
  product: (idOrSlug, signal) => request(`/products/${idOrSlug}`, { signal }),
  categories: (signal) => request('/categories', { signal }),
  category: (slug, signal) => request(`/categories/${slug}`, { signal }),

  // ── Delivery ──────────────────────────────────────────────────────────────
  wilayas: (signal) => request('/wilayas', { signal }),
  quoteDelivery: (params, signal) => request(`/livraison/quote${qs(params)}`, { signal }),

  // ── Settings ──────────────────────────────────────────────────────────────
  settings: (signal) => request('/settings', { signal }),

  // ── Orders ────────────────────────────────────────────────────────────────
  createOrder: (body) => request('/orders', { method: 'POST', body }),
  lookupOrder: (params, signal) => request(`/orders/lookup${qs(params)}`, { signal }),
  myOrders: (signal) => request('/orders/mine', { signal }),

  // ── Contact ───────────────────────────────────────────────────────────────
  sendMessage: (body) => request('/messages', { method: 'POST', body }),

  // ── Account ───────────────────────────────────────────────────────────────
  me: (signal) => request('/auth/me', { signal }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body }),
  changePassword: (body) => request('/auth/password', { method: 'PUT', body }),
  addAddress: (body) => request('/auth/adresses', { method: 'POST', body }),
  deleteAddress: (id) => request(`/auth/adresses/${id}`, { method: 'DELETE' }),
  favourites: (signal) => request('/auth/favoris', { signal }),
  toggleFavourite: (productId) => request(`/auth/favoris/${productId}`, { method: 'POST' }),

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: {
    dashboard: (signal) => request('/admin/dashboard', { signal }),

    products: (params, signal) => request(`/admin/products${qs(params)}`, { signal }),
    createProduct: (form) => request('/admin/products', { method: 'POST', body: form, isForm: true }),
    updateProduct: (id, form) =>
      request(`/admin/products/${id}`, { method: 'PUT', body: form, isForm: true }),
    deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),

    categories: (signal) => request('/admin/categories', { signal }),
    createCategory: (form) => request('/admin/categories', { method: 'POST', body: form, isForm: true }),
    updateCategory: (id, form) =>
      request(`/admin/categories/${id}`, { method: 'PUT', body: form, isForm: true }),
    deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
    reorderCategories: (ordres) => request('/admin/categories/reorder', { method: 'PUT', body: { ordres } }),

    orders: (params, signal) => request(`/admin/orders${qs(params)}`, { signal }),
    order: (id, signal) => request(`/admin/orders/${id}`, { signal }),
    setOrderStatus: (id, statut) => request(`/admin/orders/${id}/statut`, { method: 'PUT', body: { statut } }),
    setOrderNote: (id, noteInterne) =>
      request(`/admin/orders/${id}/note`, { method: 'PUT', body: { noteInterne } }),

    updateWilayas: (wilayas) => request('/admin/wilayas/bulk', { method: 'PUT', body: { wilayas } }),

    messages: (params, signal) => request(`/admin/messages${qs(params)}`, { signal }),
    setMessageStatus: (id, statut) => request(`/admin/messages/${id}`, { method: 'PUT', body: { statut } }),
    deleteMessage: (id) => request(`/admin/messages/${id}`, { method: 'DELETE' }),

    updateSettings: (body) => request('/admin/settings', { method: 'PUT', body }),
  },
};

export default api;
