/**
 * URL base de la API.
 * Forzada a la IP de AWS con HTTP (sin la S) para evitar errores de SSL con el backend de Java.
 */
export function getApiBaseUrl(): string {
  return 'http://100.50.61.245:8080/api';
}