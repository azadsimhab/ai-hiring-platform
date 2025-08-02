import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { authService } from './services/authService';

// Components
import { LandingPage } from './components/LandingPage';
import { AgentDashboard } from './components/dashboard/AgentDashboard';
import { OAuthCallback } from './components/auth/OAuthCallback';
import { ErrorDocumentationSuite } from './components/testing/ErrorDocumentationSuite';

// Google OAuth Client ID - Production credentials
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '1059515914490-mror8dqhgdgi2qaoeidrqulfr8ml7f0j.apps.googleusercontent.com';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  google_id: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
          // Verify token is still valid
          const isValid = await authService.verifyToken();
          if (isValid) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle Google OAuth login - Now handled by GoogleOAuthButton component
  const handleGoogleLogin = () => {
    // This function is now primarily for backward compatibility
    // Real OAuth is handled by GoogleOAuthButton component
    setAuthError(null);
  };

  // Handle OAuth callback success
  const handleOAuthSuccess = (userData: User) => {
    setUser(userData);
    setAuthError(null);
  };

  // Handle OAuth callback error
  const handleOAuthError = (error: string) => {
    setAuthError(error);
    setUser(null);
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAuthError(null);
  };

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#fff',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
              },
            }}
          />
          
          <Routes>
          {/* Public Landing Page */}
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LandingPage 
                  onGoogleLogin={handleGoogleLogin}
                  authError={authError}
                />
              )
            } 
          />
          
          
          {/* OAuth Callback Handler */}
          <Route 
            path="/auth/callback" 
            element={
              <OAuthCallback 
                onSuccess={handleOAuthSuccess}
                onError={handleOAuthError}
              />
            } 
          />
          
          {/* Protected Dashboard Route */}
          <Route 
            path="/dashboard" 
            element={
              user ? (
                <AgentDashboard 
                  user={user}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* Testing Suite Route */}
          <Route 
            path="/testing" 
            element={<ErrorDocumentationSuite />} 
          />
          
          {/* Redirect any other routes */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;