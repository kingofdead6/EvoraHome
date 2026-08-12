// The deployed API. This is the real backend on Render and it is the default
// the storefront uses, in development and in production alike.
//
// To point a local build at a local server instead, set VITE_API_URL in
// client/.env.local. Nothing else needs to change.
export const API_BASE_URL = "https://evorahome.onrender.com/api";

export default API_BASE_URL;
