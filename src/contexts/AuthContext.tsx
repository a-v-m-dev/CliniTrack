import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PouchDB from 'pouchdb-browser';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'secretary' | 'doctor';
}

interface LoginResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (email: string, password: string, name: string, role: 'secretary' | 'doctor') => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize PouchDB
const db = new PouchDB('CliniTrack');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('clinitrack_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // ✅ LOGIN using PouchDB
  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const userId = email.toLowerCase();
      const doc = await db.get(userId);

      if (doc && doc.password === password) {
        const userData: User = {
          id: doc._id!,
          email: doc.email,
          name: doc.name,
          role: doc.role
        };

        setUser(userData);
        localStorage.setItem('clinitrack_user', JSON.stringify(userData));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Incorrect Email or Password' };
      }
    } catch (err: any) {
      setIsLoading(false);
      if (err.status === 404) {
        return { success: false, error: 'Incorrect Email or Password' };
      }
      console.error('Login failed:', err);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // ✅ REGISTER new user into PouchDB
  const register = async (email: string, password: string, name: string, role: 'secretary' | 'doctor'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userId = email.toLowerCase();

      // check if already exists
      const existing = await db.get(userId).catch(() => null);
      if (existing) {
        setIsLoading(false);
        return false; // already exists
      }

      const newUser = {
        _id: userId,
        email: email.toLowerCase(),
        password,
        name,
        role,
        type: 'user'
      };

      await db.put(newUser);

      const userData: User = {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      };

      setUser(userData);
      localStorage.setItem('clinitrack_user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clinitrack_user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('clinitrack_user', JSON.stringify(updatedUser));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const doc = await db.get(user.email.toLowerCase());
      if (doc.password === currentPassword) {
        doc.password = newPassword;
        await db.put(doc);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Change password failed:', err);
      return false;
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      const doc = await db.get(email.toLowerCase());
      return !!doc;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        requestPasswordReset,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}