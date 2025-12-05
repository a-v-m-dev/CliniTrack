import React, { useState } from 'react';
import PouchDB from 'pouchdb-browser';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react';
import { useEmailService } from '../../hooks/useEmailService';

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

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Use EmailJS hook
  const { sendPasswordResetEmail, isLoading, error: emailError, clearError } = useEmailService();

  const generateResetToken = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Date.now().toString(36);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setMessage('');
    clearError();

    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    try {
      // Check if user exists
      let userExists = false;
      let userName = '';

      try {
        const userDocId = `user_${email}`;
        const userDoc = await db.get(userDocId) as UserRecord;
        
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
        // Security: Don't reveal if email exists
        setMessage('If an account with this email exists, password reset instructions have been sent.');
        setSubmitted(true);
        return;
      }

      // Generate reset token and link
      const resetToken = generateResetToken();
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;

      // Store token in PouchDB
      const resetTokenDoc = {
        _id: `reset_token_${resetToken}`,
        type: 'password_reset_token',
        email: email,
        token: resetToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        used: false,
        createdAt: new Date().toISOString()
      };

      await db.put(resetTokenDoc);

      // 🔥 Send email using EmailJS
      const emailResult = await sendPasswordResetEmail({
        to: email,
        name: userName,
        resetLink: resetLink
      });

      if (emailResult.success) {
        setMessage(`Password reset instructions have been sent to ${email}. Check your inbox!`);
        setSubmitted(true);
      } else {
        setLocalError(emailResult.error || 'Failed to send reset email. Please try again.');
      }

    } catch (err) {
      console.error('Password reset error:', err);
      setLocalError('An unexpected error occurred. Please try again.');
    }
  };

  const handleResetAnother = () => {
    setSubmitted(false);
    setEmail('');
    setMessage('');
    setLocalError('');
    clearError();
  };

  const displayError = localError || emailError;

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

            {displayError && (
              <Alert variant="destructive">
                <AlertDescription>{displayError}</AlertDescription>
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
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">
              <strong>Powered by EmailJS:</strong> Real emails will be sent instantly. 
              No backend setup required!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}