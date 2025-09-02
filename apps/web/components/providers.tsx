'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, createContext, useContext, useEffect } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = () => {
    authAPI.googleLogin();
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, loading, login, logout, refetch: fetchUser }}>
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}