import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/pocketbase-client'; // Changed from api-client to pocketbase-client
import { pb } from '../lib/pocketbase'; // Added PocketBase instance for auth state

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, inviteCode: string) => Promise<{ error: Error | null; user: { id: string; email: string; name: string; role: string } | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in via PocketBase authStore
    const checkAuth = async () => {
      if (pb.authStore.isValid && pb.authStore.record) {
        try {
          // Refresh auth state from PocketBase
          await pb.collection('users').authRefresh();
          const record = pb.authStore.record;
          setUser({
            id: record.id,
            email: record.email,
            name: record.name,
            role: record.role,
            avatar_url: record.avatar,
          });
        } catch (error) {
          // Token expired or invalid
          pb.authStore.clear();
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen to auth store changes
    const unsubscribe = pb.authStore.onChange((token, record) => {
      if (record) {
        setUser({
          id: record.id,
          email: record.email,
          name: record.name,
          role: record.role,
          avatar_url: record.avatar,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string, inviteCode: string) => {
    try {
      const data = await api.register(email, password, name, inviteCode);
      setUser(data.user);
      return { error: null, user: data.user };
    } catch (error) {
      return { error: error as Error, user: null };
    }
  };

  const signOut = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};