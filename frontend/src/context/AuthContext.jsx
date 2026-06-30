"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { clearSession, getSession, saveSession } from "@/lib/auth";

const AuthContext = createContext(null);

/**
 * Wrap the whole application with this provider so any component
 * can call `useAuth()` to read or mutate auth state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on first mount.
  useEffect(() => {
    const session = getSession();
    if (session?.token && session?.user) {
      setUser(session.user);
      setToken(session.token);
    }
    setLoading(false);
  }, []);

  /**
   * Call this after a successful login or register API response.
   * @param {{ user: object, token: string, expiresAt: string }} responseData
   */
  const login = useCallback((responseData) => {
    const session = {
      user: responseData.user,
      token: responseData.token,
      expiresAt: responseData.expiresAt,
    };
    saveSession(session);
    setUser(responseData.user);
    setToken(responseData.token);
  }, []);

  /** Clear the session and reset auth state. */
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Convenience hook — throws if used outside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return ctx;
}
