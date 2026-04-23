export const API_BASE_URL = "http://100.50.61.245:8080";

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || API_BASE_URL;
}
