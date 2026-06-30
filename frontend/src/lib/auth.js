const SESSION_KEY = "auth_session";

/**
 * Persist the auth response (user + token) to localStorage.
 * @param {{ user: object, token: string, expiresAt: string }} session
 */
export function saveSession(session) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // storage might be unavailable (private mode, etc.)
  }
}

/**
 * Read the persisted session from localStorage.
 * @returns {{ user: object, token: string, expiresAt: string } | null}
 */
export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Remove the session from localStorage (logout).
 */
export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
