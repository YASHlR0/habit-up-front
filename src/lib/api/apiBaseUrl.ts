export const API_BASE_URL = "https://habitup.devpaulvelasco.com/api";

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || API_BASE_URL;
}
