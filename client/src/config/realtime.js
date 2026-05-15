/**
 * Public Socket.io base URL (scheme + host + optional port, no trailing slash).
 * In production builds, VITE_SOCKET_URL must be set at build time (e.g. Vercel env) to your hosted API.
 */
export function getSocketBaseUrl() {
  const raw = import.meta.env.VITE_SOCKET_URL;
  const v = raw != null ? String(raw).trim() : '';
  if (v) return v.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:3001';
  return '';
}

/** False in production when the app was built without VITE_SOCKET_URL — realtime and admin login cannot work. */
export function isRealtimeConfigured() {
  return Boolean(getSocketBaseUrl());
}
