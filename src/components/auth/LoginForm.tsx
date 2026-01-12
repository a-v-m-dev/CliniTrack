import React, { useState } from 'react';
import PouchDB from 'pouchdb-browser';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import clinitrackLogo from '../../assets/clinitrackLogo.png';

// Initialize PouchDB database
const db = new PouchDB('CliniTrack');

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister: () => void;
}

interface UserRecord {
  _id: string;
  type: 'user';
  name: string;
  email: string;
  password: string;
  role: 'secretary' | 'doctor';
  createdAt: string;
  synced?: boolean;
}

export function LoginForm({ onForgotPassword, onRegister }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingLocal, setIsCheckingLocal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsCheckingLocal(true);

    try {
      // First, try remote login
      console.log('🔐 Attempting remote login...');
      const remoteResult = await login(formData.email, formData.password);

      if (remoteResult.success) {
        console.log('✅ Remote login successful!');
        return;
      }

      // If remote login fails, try local PouchDB authentication
      console.log('🌐 Remote login failed, checking local database...');
      
      try {
        // Try to find user in local PouchDB
        const userDocId = `user_${formData.email}`;
        const userDoc = await db.get(userDocId) as UserRecord;
        
        if (userDoc && userDoc.type === 'user') {
          // Verify password (in production, you should hash passwords!)
          if (userDoc.password === formData.password) {
            console.log('✅ Local login successful!');
            
            // Simulate login success by calling the auth context with local user data
            // You might need to modify your AuthContext to handle local logins
            const localLoginResult = await login(formData.email, formData.password);
            
            if (localLoginResult.success) {
              console.log('✅ Local authentication completed!');
              return;
            } else {
              setError('Local authentication failed.');
            }
          } else {
            setError('Invalid password.');
          }
        } else {
          setError('User not found locally. Please check your credentials.');
        }
      } catch (localErr: any) {
        if (localErr.name === 'not_found') {
          setError('User not found. Please check your email or register.');
        } else {
          console.error('Local auth error:', localErr);
          setError('Authentication error. Please try again.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsCheckingLocal(false);
    }
  };

  const handleDemoLogin = async (email: string, password: string) => {
    setFormData({ email, password });
    
    // Small delay to let the form update
    setTimeout(async () => {
      await handleSubmit(new Event('submit') as any);
    }, 100);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-3">
            <ImageWithFallback
              src={clinitrackLogo}
              alt="CliniTrack Logo"
              className="h-10 w-auto logo-no-bg"
            />
          </div>
          <div className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your medical records system
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isLoading || isCheckingLocal}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading || isCheckingLocal}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || isCheckingLocal}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isCheckingLocal}
          >
            {(isLoading || isCheckingLocal) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isCheckingLocal ? 'Checking local database...' : 'Signing in...'}
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="text-center space-y-2">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto"
              onClick={onForgotPassword}
            >
              Forgot your password?
            </Button>
            <div className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={onRegister}
              >
                Sign up
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}