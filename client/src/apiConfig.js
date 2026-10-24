// Centralized API configuration for local, production, and GitHub Pages hosting

export const API_BASE = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 
  (typeof window !== 'undefined' && window.location.hostname.includes('github.io')
    ? 'https://veterinary-shelter-ref-par.trycloudflare.com'
    : '');

export function apiUrl(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}
