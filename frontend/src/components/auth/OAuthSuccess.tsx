import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface OAuthSuccessProps {
  userData: any;
  onRedirect: () => void;
}

export function OAuthSuccess({ userData, onRedirect }: OAuthSuccessProps) {
  useEffect(() => {
    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      onRedirect();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onRedirect]);

  return (
    <div className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-dark-800/90 to-dark-900/90 border border-primary-400/30 rounded-2xl p-8 max-w-md mx-4 text-center backdrop-blur-md"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-6 bg-emerald-500/20 rounded-full flex items-center justify-center"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-8 h-8 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>

        {/* Welcome Message */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Welcome, {userData?.name}!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 mb-6"
        >
          Authentication successful. Redirecting to your dashboard...
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <div className="w-8 h-8 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}