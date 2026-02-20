export function getApiBase(): string {
  if (typeof window === 'undefined') return '';
  // In dev/local network, API runs on port 3001 of the same host
  const host = window.location.hostname;
  if (host === 'localhost' || host.match(/^192\.168\./) || host.match(/^10\./) || host.match(/^172\./)) {
    return `http://${host}:3001`;
  }
  // Production: same origin (proxy)
  return '';
}
