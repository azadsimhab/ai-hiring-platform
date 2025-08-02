import React, { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { OAuthSuccess } from './OAuthSuccess';

interface GoogleOAuthButtonProps {
  onSuccess: (userData: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  triggerAuth?: boolean;
}

export function GoogleOAuthButton({ onSuccess, onError, disabled = false, triggerAuth = false }: GoogleOAuthButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      console.log('Google OAuth Success:', credentialResponse);
      
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // Send the credential to our backend for verification
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      console.log('Sending to backend:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/v1/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        }),
      });

      console.log('Backend response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error:', errorData);
        throw new Error(errorData.detail || `Authentication failed (${response.status})`);
      }

      const data = await response.json();
      console.log('Backend success data:', data);
      
      if (data.success && data.user) {
        // Store authentication data securely
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('sessionExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
        
        console.log('User data stored, showing success screen');
        
        // Show success screen before redirecting
        setUserData(data.user);
        setShowSuccess(true);
        
        onSuccess(data.user);
      } else {
        throw new Error('Invalid response from authentication server');
      }
    } catch (error) {
      console.error('Google OAuth failed:', error);
      onError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const handleGoogleError = () => {
    console.error('Google OAuth error occurred');
    onError('Google authentication failed. Please try again.');
  };

  const handleRedirect = () => {
    console.log('Redirecting to dashboard...');
    window.location.href = '/dashboard';
  };

  if (showSuccess && userData) {
    return (
      <OAuthSuccess 
        userData={userData} 
        onRedirect={handleRedirect}
      />
    );
  }

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
      text="signin"
      shape="rectangular"
      theme="filled_blue"
      size="large"
      width="200"
    />
  );
}