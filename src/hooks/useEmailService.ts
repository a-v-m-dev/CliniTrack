import { useState } from 'react';
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init("YOUR_PUBLIC_KEY"); // This is safe to expose

interface EmailSendResult {
  success: boolean;
  error?: string;
}

interface PasswordResetData {
  to: string;
  name: string;
  resetLink: string;
}

export function useEmailService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendPasswordResetEmail = async (data: PasswordResetData): Promise<EmailSendResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const templateParams = {
        to_email: data.to,
        to_name: data.name,
        reset_link: data.resetLink,
        app_name: 'CliniTrack',
        support_email: 'support@clinitrack.com'
      };

      const result = await emailjs.send(
        'service_gmqos6h',      // EmailJS Service ID
        'template_mrkvcrh',     // EmailJS Template ID  
        templateParams
      );

      console.log('✅ Email sent successfully:', result);
      return { success: true };

    } catch (err) {
      console.error('❌ Email sending failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const sendWelcomeEmail = async (email: string, name: string): Promise<EmailSendResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const templateParams = {
        to_email: email,
        to_name: name,
        app_name: 'CliniTrack',
        welcome_message: 'Welcome to our medical records system!'
      };

      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_WELCOME_TEMPLATE_ID', 
        templateParams
      );

      return { success: true };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send welcome email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendPasswordResetEmail,
    sendWelcomeEmail,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}