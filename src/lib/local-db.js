export const CLIENTS_STORAGE_KEY = "energia-coerente-v1";

export function readLocalClients(fallback = []) {
  try {
    const raw = window.localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocalClients(clients) {
  window.localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
}
