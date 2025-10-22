import { config } from '@/config';

// Token storage keys
const ACCESS_KEY = 'fitflow_jwt';
const REFRESH_KEY = 'fitflow_refresh';

export async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${config.api.baseUrl}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || data.message || 'Invalid credentials');
  }
  const data = await response.json();
  // Backend returns { access: 'jwt-token', refresh: 'refresh-token' }
  setTokens(data.access, data.refresh);
  return data.access;
}

export function logout() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function isTokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds
    return Date.now() / 1000 > payload.exp;
  } catch {
    return true;
  }
}

export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token');
  const response = await fetch(`${config.api.baseUrl}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) {
    logout();
    throw new Error('Session expired. Please log in again.');
  }
  const data = await response.json();
  setTokens(data.access, refresh);
  return data.access;
} 