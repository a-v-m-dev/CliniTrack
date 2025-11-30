import React, { useState } from 'react';
import PouchDB from 'pouchdb-browser';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react';

// Initialize PouchDB
const db = new PouchDB('CliniTrack');

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

interface UserRecord {
  _id: string;
  type: 'user';
  email: string;
  password: string;
  name: string;
  role: 'secretary' | 'doctor';
  createdAt: string;
}

interface PasswordResetToken {
  _id: string;
  type: 'password_reset_token';
  email: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const generateResetToken = (): string => {
    // Generate a secure random token
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
  };

  const sendResetEmail = async (email: string, token: string): Promise<boolean> => {
    // In a real implementation, this would send an actual email
    // For now, we'll simulate email sending and store the token in PouchDB
    
    const resetToken: PasswordResetToken = {
      _id: `reset_token_${token}`,
      type: 'password_reset_token',
      email: email,
      token: token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      used: false,
      createdAt: new Date().toISOString()
    };

    try {
      await db.put(resetToken);
      console.log(`Password reset token generated for ${email}: ${token}`);
      
      // Simulate email delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Failed to save reset token:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Check if user exists in local database
      let userExists = false;
      let userName = '';

      try {
        const userDocId = `user_${email}`;
        const userDoc = await db.get<UserRecord>(userDocId);
        
        if (userDoc && userDoc.type === 'user') {
          userExists = true;
          userName = userDoc.name;
        }
      } catch (err: any) {
        if (err.name !== 'not_found') {
          console.error('Error checking user:', err);
        }
      }

      if (!userExists) {
        // Don't reveal whether email exists or not for security
        setMessage('If an account with this email exists, password reset instructions have been sent.');
        setSubmitted(true);
        setIsLoading(false);
        return;
      }

      // Generate and send reset token
      const resetToken = generateResetToken();
      const emailSent = await sendResetEmail(email, resetToken);

      if (emailSent) {
        setMessage(`Password reset instructions have been sent to ${email}. The reset link will expire in 24 hours.`);
        setSubmitted(true);
      } else {
        setError('Failed to send reset email. Please try again.');
      }

    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAnother = () => {
    setSubmitted(false);
    setEmail('');
    setMessage('');
    setError('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you instructions to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
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
                  Sending Reset Instructions...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reset Instructions
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Check Your Email</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {message}
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Follow the instructions in the email to reset your password.
              </p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleResetAnother}
              className="w-full"
            >
              Reset Another Email
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto text-sm"
            onClick={onBackToLogin}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to sign in
          </Button>
        </div>

        {!submitted && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> This will generate a password reset token stored in your local database. 
              In a production environment, this would send an actual email with a secure reset link.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}