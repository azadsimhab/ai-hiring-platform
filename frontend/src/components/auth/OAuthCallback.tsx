import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { ProgressRing } from '../ui/ProgressRing';
import { authService } from '../../services/authService';

interface OAuthCallbackProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

export function OAuthCallback({ onSuccess, onError }: OAuthCallbackProps) {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code received');
        }

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        // Handle OAuth callback
        const userData = await authService.handleGoogleCallback(code);
        
        clearInterval(progressInterval);
        setProgress(100);
        setStatus('success');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          onSuccess(userData.user);
        }, 1500);
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        onError(error instanceof Error ? error.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [onSuccess, onError]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="text-center p-8 max-w-md mx-auto">
          <div className="mb-6">
            <ProgressRing
              progress={progress}
              size={120}
              strokeWidth={8}
              className="mx-auto"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-hologram mb-4">
            {status === 'processing' && 'Authenticating...'}
            {status === 'success' && 'Welcome to AI Hiring Platform!'}
            {status === 'error' && 'Authentication Failed'}
          </h2>
          
          <p className="text-white/70">
            {status === 'processing' && 'Verifying your Google account and setting up your workspace.'}
            {status === 'success' && 'Redirecting to your dashboard...'}
            {status === 'error' && 'There was an issue with authentication. Please try again.'}
          </p>
          
          {status === 'processing' && (
            <div className="mt-6 space-y-2 text-sm text-white/60">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                ✓ Verifying Google credentials
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                ✓ Creating user profile
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
              >
                ✓ Initializing AI agents
              </motion.div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}