'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Role } from '@/data/mockData'; // keep frontend type

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<{ success: boolean; message?: string; role?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; message?: string; role?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
});

// Helper to map backend user object to frontend mockData User interface
function mapBackendUser(backendUser: any): User {
  return {
    id: backendUser._id,
    email: backendUser.email,
    role: backendUser.role as Role,
    name: backendUser.name,
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(backendUser.name)}&background=random`,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in via HttpOnly cookie
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.data?.user) {
          setUser(mapBackendUser(data.data.user));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials: any) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        setUser(mapBackendUser(data.data.user));
        return { success: true, role: data.data.user.role };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: "Network error occurred." };
    }
  };

  const signup = async (userData: any) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.data?.user) {
        setUser(mapBackendUser(data.data.user));
        return { success: true, role: data.data.user.role };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: "Network error occurred." };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
