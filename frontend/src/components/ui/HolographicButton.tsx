import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface HolographicButtonProps {
  children: ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const buttonVariants = {
  primary: {
    background: 'linear-gradient(135deg, #00ffff 0%, #0080ff 50%, #8000ff 100%)',
    borderColor: '#00ffff'
  },
  secondary: {
    background: 'linear-gradient(135deg, #ff00ff 0%, #8000ff 50%, #0080ff 100%)',
    borderColor: '#ff00ff'
  },
  success: {
    background: 'linear-gradient(135deg, #00ff00 0%, #00ff80 50%, #00ffff 100%)',
    borderColor: '#00ff00'
  },
  warning: {
    background: 'linear-gradient(135deg, #ffff00 0%, #ff8000 50%, #ff0000 100%)',
    borderColor: '#ffff00'
  },
  error: {
    background: 'linear-gradient(135deg, #ff0000 0%, #ff0080 50%, #ff00ff 100%)',
    borderColor: '#ff0000'
  }
};

const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

export function HolographicButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}: HolographicButtonProps) {
  const variantStyle = buttonVariants[variant];
  const sizeStyle = buttonSizes[size];

  return (
    <motion.button
      className={`
        relative overflow-hidden rounded-lg font-semibold font-mono
        border-2 transition-all duration-300
        ${sizeStyle} ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        background: variantStyle.background,
        borderColor: variantStyle.borderColor,
        boxShadow: `0 0 20px ${variantStyle.borderColor}40`
      }}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { 
        scale: 1.05,
        boxShadow: `0 0 30px ${variantStyle.borderColor}60`
      }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      disabled={disabled}
      type={type}
    >
      {/* Holographic overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent">
        <div 
          className="absolute inset-0 rounded-lg animate-pulse"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${variantStyle.borderColor}, transparent)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude'
          }}
        />
      </div>
      
      {/* Content */}
      <span className="relative z-10 text-white drop-shadow-lg">
        {children}
      </span>
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${variantStyle.borderColor}20 0%, transparent 70%)`,
          filter: 'blur(10px)'
        }}
      />
    </motion.button>
  );
} 