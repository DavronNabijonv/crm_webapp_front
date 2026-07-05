'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, tokenStore } from '@/lib/api-client';
import type { TokenPair, User } from '@/lib/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  acceptInvite: (token: string, fullName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.getAccess() && !tokenStore.getRefresh()) {
      setLoading(false);
      return;
    }
    api<User>('/users/me')
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const pair = await api<TokenPair>('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    tokenStore.set(pair);
    setUser(pair.user);
  }, []);

  const acceptInvite = useCallback(async (token: string, fullName: string, password: string) => {
    const pair = await api<TokenPair>('/auth/accept-invite', {
      method: 'POST',
      body: { token, full_name: fullName, password }
    });
    tokenStore.set(pair);
    setUser(pair.user);
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokenStore.getRefresh();
    if (refresh) {
      await api('/auth/logout', { method: 'POST', body: { refresh_token: refresh } }).catch(
        () => undefined
      );
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, acceptInvite, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
