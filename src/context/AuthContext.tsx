import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthUser } from '../types/game';
import { gotakAPI } from '../services/api';
import {
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
} from '../services/authStorage';
import { logException } from '../utils/logger';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const applySession = useCallback((token: string | null, user: AuthUser | null) => {
    gotakAPI.setToken(token);
    setState({
      user,
      token,
      isLoading: false,
      isAuthenticated: Boolean(token && user),
    });
  }, []);

  const logout = useCallback(async () => {
    await clearStoredAuth();
    applySession(null, null);
  }, [applySession]);

  useEffect(() => {
    gotakAPI.setUnauthorizedHandler(() => {
      void logout();
    });
    return () => gotakAPI.setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await getStoredAuth();
      if (cancelled) return;
      if (!stored) {
        applySession(null, null);
        return;
      }
      gotakAPI.setToken(stored.token);
      try {
        const profile = await gotakAPI.getProfile();
        if (cancelled) return;
        await setStoredAuth(stored.token, profile);
        applySession(stored.token, profile);
      } catch (error) {
        logException(error instanceof Error ? error : new Error(String(error)), {
          method: 'restoreSession',
        });
        await clearStoredAuth();
        if (!cancelled) {
          applySession(null, null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token, user } = await gotakAPI.login(email.trim(), password);
      await setStoredAuth(token, user);
      applySession(token, user);
    },
    [applySession],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      await gotakAPI.register(email.trim(), password, name.trim());
      await login(email, password);
    },
    [login],
  );

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
    }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
