import React from 'react';
import { motion } from 'framer-motion';

// Fallback 3D Scene using pure CSS
export function FallbackScene({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* CSS-based floating shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg shadow-glow"
        animate={{ 
          rotateX: [0, 360],
          rotateY: [0, 180],
          y: [0, -20, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{ transformStyle: 'preserve-3d' }}
      />
      
      <motion.div
        className="absolute top-1/2 right-1/3 w-12 h-12 bg-gradient-to-br from-electric-400 to-electric-600 rounded-full shadow-glow-electric"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          x: [0, 30, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 left-1/2 w-8 h-16 bg-gradient-to-t from-emerald-400 to-emerald-600 transform rotate-45 shadow-glow-success"
        animate={{ 
          rotateZ: [45, 225, 45],
          y: [0, -15, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      {/* Connecting lines */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-px bg-gradient-to-r from-primary-400 to-transparent"
          animate={{ 
            scaleX: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 0.5
          }}
          style={{ transformOrigin: 'left' }}
        />
        
        <motion.div
          className="absolute top-1/2 right-1/3 w-px h-24 bg-gradient-to-b from-electric-400 to-transparent"
          animate={{ 
            scaleY: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1.5
          }}
          style={{ transformOrigin: 'top' }}
        />
      </div>
      
      {/* Background grid */}
      <div className="absolute inset-0 neural-grid opacity-10"></div>
    </div>
  );
}

// Fallback Background
export function FallbackBackground({ 
  children, 
  className = '' 
}: { 
  children?: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={`fixed inset-0 bg-dark-900 ${className}`}>
      {/* Multi-layer gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-primary-900/10 to-electric-900/10"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-emerald-900/5 via-transparent to-amber-900/5"></div>
      
      {/* Animated mesh gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-radial from-primary-500/20 via-transparent to-electric-500/20"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/6 w-32 h-32 bg-primary-500/20 rounded-full blur-xl"
        animate={{ 
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.5, 1]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-electric-500/20 rounded-full blur-xl"
        animate={{ 
          x: [0, -80, 0],
          y: [0, 30, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2
        }}
      />
      
      {children}
      
      {/* Overlay effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-dark-900/20 to-dark-900/40 pointer-events-none" />
      
      {/* Scan lines */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/10 to-transparent h-2"
        animate={{ y: ['0%', '100%'] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}