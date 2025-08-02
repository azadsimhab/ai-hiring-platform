import React from 'react';
import { motion } from 'framer-motion';

// 2D Floating UI Cards
interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FloatingCard({ children, delay = 0, className = '' }: FloatingCardProps) {
  return (
    <motion.div
      className={`absolute z-20 ${className}`}
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        transition: {
          duration: 0.8,
          delay,
          ease: "easeOut"
        }
      }}
      whileHover={{
        y: -10,
        rotateX: 5,
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
    >
      <div className="glass rounded-xl p-6 shadow-glow backdrop-blur-xl">
        {children}
      </div>
    </motion.div>
  );
}

// Particle Field Background (Pure CSS)
export function ParticleField({ particleCount = 100, className = '' }: { particleCount?: number; className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      {[...Array(particleCount)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary-400 rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
}

// Holographic Interface Elements
export function HolographicInterface({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Scanning lines */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/20 to-transparent h-2"
        animate={{ y: ['0%', '100%'] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary-400"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary-400"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary-400"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary-400"></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 neural-grid opacity-20"></div>
    </div>
  );
}

// Pure CSS Background without any Three.js
export function PureCSSBackground({ 
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
      
      {/* CSS-based 3D shapes */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-primary-400/30 to-primary-600/30 rounded-lg shadow-glow"
        animate={{ 
          rotateX: [0, 360],
          rotateY: [0, 180],
          y: [0, -20, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{ transformStyle: 'preserve-3d' }}
      />
      
      <motion.div
        className="absolute top-2/3 right-1/3 w-16 h-16 bg-gradient-to-br from-electric-400/30 to-electric-600/30 rounded-full shadow-glow-electric"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          x: [0, 30, 0]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
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