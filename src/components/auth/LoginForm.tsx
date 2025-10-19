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
import clinitrackText from '../../assets/clinitrackLogo.png';

// Initialize PouchDB database
const db = new PouchDB('CliniTrack');

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister: () => void;
}

interface UserRecord {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'secretary' | 'doctor';
  type: 'user';
}

export function LoginForm({ onForgotPassword, onRegister }: LoginFormProps) {
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!formData.email || !formData.password) {
    setError('Please fill in all required fields.');
    return;
  }

  const result = await login(formData.email, formData.password);

  if (!result.success) {
    setError(result.error || 'Login failed.');
  } else {
    console.log('✅ Logged in successfully!');
  }
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
            <ImageWithFallback
              src={clinitrackText}
              alt="CliniTrack"
              className="h-7 w-auto logo-no-bg"
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
              disabled={isLoading}
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
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
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

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Demo Accounts:</p>
          <div className="text-xs space-y-1">
            <div>Doctor: doctor@clinitrack.com / doctor123</div>
            <div>Secretary: secretary@clinitrack.com / secretary123</div>
          </div>
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-emerald-600">Direct login enabled - No 2FA required</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}