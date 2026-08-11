// Backend API base URL. Per-store deployment value — override with the
// VITE_API_BASE_URL environment variable (e.g. in client/.env) per store. The
// fallback keeps the reference demo working out of the box.
export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "https://novyxmobile.onrender.com/api";
