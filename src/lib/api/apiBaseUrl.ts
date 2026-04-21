/**
 * URL base de la API.
 * - Producción: `/api` (mismo origen; Nginx reenvía al backend).
 * - Desarrollo: Vite hace proxy de `/api` → backend local (vite.config).
 * - Override: define `VITE_API_URL` (ej. http://127.0.0.1:8080/api).
 */
export function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_URL;
  if (typeof env === 'string' && env.trim() !== '') {
    return env.replace(/\/+$/, '');
  }
  return '/api';
}
