import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('fd_user');
    if (stored) setUser(JSON.parse(stored));
    setReady(true);
  }, []);

  async function login(email, password) {
    const data = await api.login(email, password);
    localStorage.setItem('fd_token', data.token);
    localStorage.setItem('fd_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('fd_token');
    localStorage.removeItem('fd_user');
    setUser(null);
  }

  const can = {
    write:       user?.role === 'admin',
    analytics:   user?.role === 'analyst' || user?.role === 'admin',
    manageUsers: user?.role === 'admin',
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout, ready, can }}>
      {ready ? children : null}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
