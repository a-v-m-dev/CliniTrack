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
  updateProfile: (profileData: { name: string; email: string }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize PouchDB
const db = new PouchDB('CliniTrack');

// Define User document interface for PouchDB
interface UserDoc {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'secretary' | 'doctor';
  type: 'user';
  createdAt: string;
  updatedAt?: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('clinitrack_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Verify user still exists in PouchDB
          try {
            await db.get(userData.id);
            setUser(userData);
          } catch {
            // User no longer exists in DB, clear local storage
            localStorage.removeItem('clinitrack_user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const userId = email.toLowerCase();
      const doc = await db.get(userId) as UserDoc;

      if (doc && doc.password === password) {
        const userData: User = {
          id: doc._id,
          email: doc.email,
          name: doc.name,
          role: doc.role
        };

        setUser(userData);
        localStorage.setItem('clinitrack_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: 'Incorrect Email or Password' };
      }
    } catch (err: any) {
      if (err.status === 404) {
        return { success: false, error: 'Incorrect Email or Password' };
      }
      console.error('Login failed:', err);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: 'secretary' | 'doctor'): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userId = email.toLowerCase();

      // Check if user already exists
      try {
        await db.get(userId);
        return false; // User already exists
      } catch (err: any) {
        if (err.status !== 404) throw err;
      }

      const newUser: UserDoc = {
        _id: userId,
        email: email.toLowerCase(),
        password,
        name,
        role,
        type: 'user',
        createdAt: new Date().toISOString()
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
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clinitrack_user');
  };

  const updateProfile = async (profileData: { name: string; email: string }): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const userDoc = await db.get(user.id) as UserDoc;
      
      const updatedUserDoc: UserDoc = {
        ...userDoc,
        name: profileData.name,
        email: profileData.email.toLowerCase(),
        updatedAt: new Date().toISOString()
      };
      
      await db.put(updatedUserDoc);
      
      const updatedUser: User = {
        id: updatedUserDoc._id,
        email: updatedUserDoc.email,
        name: updatedUserDoc.name,
        role: updatedUserDoc.role
      };
      
      setUser(updatedUser);
      localStorage.setItem('clinitrack_user', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const userDoc = await db.get(user.id) as UserDoc;
      
      if (userDoc.password === currentPassword) {
        userDoc.password = newPassword;
        userDoc.updatedAt = new Date().toISOString();
        await db.put(userDoc);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Change password failed:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      await db.get(email.toLowerCase());
      return true;
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