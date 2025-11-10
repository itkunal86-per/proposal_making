import { AUTH_USERS, type AuthUserRecord, type UserRole } from "@/data/users";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  company?: string;
};

const STORAGE_KEY = "proposal_ai_auth_user";
const TOKEN_KEY = "proposal_ai_auth_token";

type StoredAuthPayload = {
  user: AuthenticatedUser;
  token?: string;
  persistedAt: number;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readFromStorage(store: Storage | null): StoredAuthPayload | null {
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthPayload;
    if (!parsed?.user?.id || !parsed.user.email || !parsed.user.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getStoredAuth(): StoredAuthPayload | null {
  if (!isBrowser()) return null;
  return readFromStorage(window.localStorage) ?? readFromStorage(window.sessionStorage);
}

function writeToStorage(store: Storage, payload: StoredAuthPayload) {
  store.setItem(STORAGE_KEY, JSON.stringify(payload));
  if (payload.token) {
    store.setItem(TOKEN_KEY, payload.token);
  }
}

export function persistAuth(user: AuthenticatedUser, token: string | undefined, remember: boolean) {
  if (!isBrowser()) return;
  const payload: StoredAuthPayload = { user, token, persistedAt: Date.now() };
  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  writeToStorage(target, payload);
  other.removeItem(STORAGE_KEY);
  other.removeItem(TOKEN_KEY);
}

export function getStoredToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY);
}

export function clearAuth() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function authenticate(email: string, password: string): AuthUserRecord | null {
  const normalizedEmail = email.trim().toLowerCase();
  return (
    AUTH_USERS.find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail && user.password === password,
    ) ?? null
  );
}

export function isRole(user: AuthenticatedUser | null, role: UserRole): boolean {
  return !!user && user.role === role;
}
