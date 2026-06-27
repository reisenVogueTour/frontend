import type { PublicUser } from "./types/reisen";

const TOKEN_KEY = "tc_token";
const USER_KEY = "tc_user";
const AUTH_SESSION_EVENT = "tc_auth_session_changed";

export function notifyAuthSessionChanged() {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function subscribeToAuthSessionChange(callback: () => void) {
  window.addEventListener(AUTH_SESSION_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getDashboardPath() {
  return "/dashboard";
}

export function getStoredUser(): PublicUser | null {
  if (typeof window === "undefined") return null;

  const rawUser = window.localStorage.getItem(USER_KEY);

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as PublicUser;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeAuthSession(input: { token: string; user: PublicUser }) {
  window.localStorage.setItem(TOKEN_KEY, input.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(input.user));
  notifyAuthSessionChanged();
}

export function clearAuthSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  notifyAuthSessionChanged();
}

export function getStoredDashboardPath() {
  if (!getStoredToken()) return "/auth";

  return getDashboardPath();
}
