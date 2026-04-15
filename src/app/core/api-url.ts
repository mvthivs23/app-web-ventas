import { environment } from '../../environments/environment';

export function apiBase(): string {
  return environment.apiUrl || '';
}

export function apiUrl(path: string): string {
  const base = apiBase();
  const p = path.startsWith('/') ? path : '/' + path;
  if (!base) {
    return p;
  }
  return base.replace(/\/$/, '') + p;
}
