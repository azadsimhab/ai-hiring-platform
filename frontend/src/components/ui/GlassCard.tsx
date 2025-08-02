import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'dark';
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  variant = 'default',
  hover = true,
  glow = false,
  onClick
}: GlassCardProps) {
  const variants = {
    default: 'glass',
    strong: 'glass-strong', 
    dark: 'glass-dark'
  };

  const glowClass = glow ? 'shadow-glow' : '';
  const hoverClass = hover ? 'hover:shadow-glow-lg transition-all duration-300' : '';

  return (
    <motion.div
      className={`
        ${variants[variant]} 
        rounded-2xl p-6 
        ${glowClass} 
        ${hoverClass} 
        ${onClick ? 'cursor-pointer' : ''} 
        ${className}
        hardware-accelerated
      `}
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}