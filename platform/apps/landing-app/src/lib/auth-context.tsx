import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

export interface GoogleProfile {
  email: string;
  firstName: string;
  lastName: string;
  googleId: string;
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  googleProfile: GoogleProfile | null;
  clearGoogleProfile: () => void;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'berhot_auth';
const API_BASE = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_URL || '/api';

function getStoredAuth(): { accessToken: string; refreshToken: string; user: User } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

function storeAuth(accessToken: string, refreshToken: string, user: User) {
  // Preserve existing fields like posProduct when re-storing auth
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      const parsed = JSON.parse(existing);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, accessToken, refreshToken, user }));
      return;
    }
  } catch {
    // ignore — fall through to fresh store
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, refreshToken, user }));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

// Parse tokens from URL hash (used after OAuth redirect)
function parseHashTokens(): { accessToken: string; refreshToken: string } | null {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token')) return null;

  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (accessToken && refreshToken) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return { accessToken, refreshToken };
  }
  return null;
}

// Parse Google new-user profile from URL hash (user needs to register)
function parseGoogleProfile(): GoogleProfile | null {
  const hash = window.location.hash;
  if (!hash || !hash.includes('google_new_user')) return null;

  const params = new URLSearchParams(hash.substring(1));
  if (params.get('google_new_user') !== 'true') return null;

  const profile: GoogleProfile = {
    email: params.get('google_email') || '',
    firstName: params.get('google_first_name') || '',
    lastName: params.get('google_last_name') || '',
    googleId: params.get('google_id') || '',
  };

  // Clean up the hash
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [googleProfile, setGoogleProfile] = useState<GoogleProfile | null>(null);

  const login = useCallback((token: string, refreshToken: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    storeAuth(token, refreshToken, userData);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    clearAuth();
  }, []);

  const clearGoogleProfile = useCallback(() => {
    setGoogleProfile(null);
  }, []);

  // Initialize from storage or hash on mount
  useEffect(() => {
    // Check for Google new user profile first
    const profile = parseGoogleProfile();
    if (profile) {
      setGoogleProfile(profile);
      return;
    }

    // Check hash for OAuth tokens (existing user sign-in)
    const hashTokens = parseHashTokens();
    if (hashTokens) {
      try {
        const payload = JSON.parse(atob(hashTokens.accessToken.split('.')[1]));
        const userData: User = {
          id: payload.userId || '',
          email: payload.email || '',
          firstName: '',
          lastName: '',
          role: payload.role || '',
          tenantId: payload.tenantId || '',
        };
        login(hashTokens.accessToken, hashTokens.refreshToken, userData);
        // Redirect to dashboard on same origin (detect lang from URL or default to 'en')
        const pathLang = window.location.pathname.split('/')[1] || 'en';
        window.location.href = `/${pathLang}/dashboard`;
      } catch {
        // Invalid token
      }
      return;
    }

    // Check localStorage — validate token against backend
    const stored = getStoredAuth();
    if (stored?.accessToken && stored?.user) {
      // Optimistically show user, then validate in background
      setAccessToken(stored.accessToken);
      setUser(stored.user);

      // Validate token is still valid (user still exists after DB reset, etc.)
      fetch(`${API_BASE}/v1/users/me`, {
        headers: { Authorization: `Bearer ${stored.accessToken}` },
      }).then(async (res) => {
        if (res.ok) return; // token valid — keep user logged in
        // Try refresh
        if (res.status === 401 && stored.refreshToken) {
          try {
            const refreshRes = await fetch(`${API_BASE}/v1/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: stored.refreshToken }),
            });
            if (refreshRes.ok) {
              const data = await refreshRes.json();
              storeAuth(data.accessToken, data.refreshToken || stored.refreshToken, stored.user);
              setAccessToken(data.accessToken);
              return;
            }
          } catch { /* refresh failed */ }
        }
        // Token invalid — log out
        setAccessToken(null);
        setUser(null);
        clearAuth();
      }).catch(() => {
        // Network error (backend down) — keep user logged in with stale data
      });
    }
  }, [login]);

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated: !!user, googleProfile, clearGoogleProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
