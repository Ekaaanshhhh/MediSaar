'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, users } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const login = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) setUser(foundUser);
  };

  const logout = () => setUser(null);

  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
