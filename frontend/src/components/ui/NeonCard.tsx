import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface NeonCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const glowColors = {
  primary: '#00ffff',
  secondary: '#ff00ff',
  success: '#00ff00',
  warning: '#ffff00',
  error: '#ff0000'
};

export function NeonCard({ 
  children, 
  className = '', 
  glowColor,
  onClick,
  variant = 'primary'
}: NeonCardProps) {
  const color = glowColor || glowColors[variant];
  
  return (
    <motion.div
      className={`relative group cursor-pointer ${className}`}
      onClick={onClick}
      whileHover={{ 
        scale: 1.02,
        boxShadow: `0 0 30px ${color}40`
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${color}20 0%, transparent 70%)`,
          filter: `blur(20px)`
        }}
      />
      
      {/* Border glow */}
      <div 
        className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-opacity-50 transition-all duration-300"
        style={{
          borderColor: color,
          boxShadow: `inset 0 0 20px ${color}20, 0 0 20px ${color}20`
        }}
      />
      
      {/* Main content */}
      <div className="relative bg-black/80 backdrop-blur-sm rounded-lg p-6 border border-gray-800/50">
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-gradient-to-br from-transparent to-current opacity-50" style={{ color }} />
        <div className="absolute top-0 right-0 w-2 h-2 bg-gradient-to-bl from-transparent to-current opacity-50" style={{ color }} />
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-gradient-to-tr from-transparent to-current opacity-50" style={{ color }} />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-gradient-to-tl from-transparent to-current opacity-50" style={{ color }} />
      </div>
    </motion.div>
  );
} 