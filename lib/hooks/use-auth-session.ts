"use client";

import { useEffect, useState } from "react";
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  subscribeToAuthSessionChange,
} from "@/lib/auth-client";
import type { PublicUser } from "@/lib/types/reisen";

export interface AuthSession {
  isLoggedIn: boolean;
  user: PublicUser | null;
  logout: () => void;
}

/**
 * Encapsulates the client-side auth session: tracks whether a user is logged
 * in, exposes the stored user, and keeps in sync across tabs/components via the
 * auth-session change event. Components consume this instead of reaching into
 * localStorage directly.
 */
export function useAuthSession(): AuthSession {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    function syncAuthState() {
      const token = getStoredToken();
      setIsLoggedIn(Boolean(token));
      setUser(token ? getStoredUser() : null);
    }

    // Defer to after hydration so server-rendered markup (logged-out) matches
    // the first client render before we read from localStorage.
    void Promise.resolve().then(syncAuthState);

    return subscribeToAuthSessionChange(syncAuthState);
  }, []);

  function logout() {
    clearAuthSession();
    setIsLoggedIn(false);
    setUser(null);
  }

  return { isLoggedIn, user, logout };
}
