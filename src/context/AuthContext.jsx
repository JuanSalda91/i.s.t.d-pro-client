import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

// Helper to safely read initial user from localStorage
function getInitialUser() {
  try {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (!token || !userRaw) return null;

    return JSON.parse(userRaw);
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
}

export function AuthProvider({ children }) {
  // Initialize from localStorage synchronously (no effect needed)
  const [user, setUser] = useState(getInitialUser);
  const [loading, setLoading] = useState(true);

  // After first render, just mark loading as false
  useEffect(() => {
    setLoading(false);
  }, []);

  const login = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

//7. convenience hook to use AuthContext
export function useAuth() {
    return useContext(AuthContext);
}