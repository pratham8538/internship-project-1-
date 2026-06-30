import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pizzania_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.me(token)
      .then(({ user }) => setUser(user))
      .catch(() => { setToken(null); localStorage.removeItem('pizzania_token'); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const { token, user } = await api.login({ email, password });
    localStorage.setItem('pizzania_token', token);
    setToken(token);
    setUser(user);
    return user;
  };

  const register = async (payload) => {
    const { token, user } = await api.register(payload);
    localStorage.setItem('pizzania_token', token);
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('pizzania_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (u) => setUser(u);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
