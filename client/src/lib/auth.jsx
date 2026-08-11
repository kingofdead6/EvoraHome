import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from './api';

/**
 * Session state.
 *
 * An account is optional everywhere on this site. Guest checkout is the default
 * path and nothing here blocks it. The account exists so a returning customer
 * gets their address pre-filled and keeps their favourites and order history.
 *
 * `loading` starts true so protected routes wait for the session check instead
 * of flashing the login page at an already-logged-in customer.
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    api
      .me(controller.signal)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const login = useCallback(async (credentials) => {
    const account = await api.login(credentials);
    setUser(account);
    return account;
  }, []);

  const register = useCallback(async (details) => {
    const account = await api.register(details);
    setUser(account);
    return account;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      // Clear locally even if the request failed. A customer who taps "se
      // déconnecter" on a shared phone must not stay logged in.
      setUser(null);
    }
  }, []);

  const toggleFavourite = useCallback(
    async (productId) => {
      if (!user) return null;
      const result = await api.toggleFavourite(productId);
      setUser((prev) => (prev ? { ...prev, favoris: result.favoris } : prev));
      return result;
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isLoggedIn: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
      setUser,
      toggleFavourite,
      isFavourite: (productId) => Boolean(user?.favoris?.some((f) => String(f) === String(productId))),
    }),
    [user, loading, login, register, logout, toggleFavourite]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
