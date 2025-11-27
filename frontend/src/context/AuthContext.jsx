// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
  });

  // --- load from localStorage on first mount ---
  useEffect(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.token) {
          setAuthState(parsed);
        }
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  // --- login function (memoized with useCallback) ---
  const login = useCallback((user, token) => {
    const newState = { user, token };
    setAuthState(newState);
    localStorage.setItem('auth', JSON.stringify(newState));
  }, []);

  // --- logout function (memoized with useCallback) ---
  const logout = useCallback(() => {
    setAuthState({ user: null, token: null });
    localStorage.removeItem('auth');
  }, []);

  // --- memoized value (useMemo) ---
  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: !!authState.token,
      login,
      logout,
    }),
    [authState, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}