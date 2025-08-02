import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
  text?: string;
  className?: string;
  glowEffect?: boolean;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#6366f1',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  showText = true,
  text,
  className = '',
  glowEffect = true
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  const normalizedRadius = (size - strokeWidth * 2) / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        height={size}
        width={size}
        className={glowEffect ? 'filter drop-shadow-lg' : ''}
      >
        {/* Background circle */}
        <circle
          stroke={backgroundColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={centerX}
          cy={centerY}
        />
        
        {/* Progress circle */}
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{
            strokeDashoffset,
            strokeLinecap: 'round',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            filter: glowEffect ? `drop-shadow(0 0 8px ${color})` : 'none'
          }}
          r={normalizedRadius}
          cx={centerX}
          cy={centerY}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Glow effect */}
        {glowEffect && (
          <motion.circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth / 2}
            strokeDasharray={strokeDasharray}
            style={{
              strokeDashoffset,
              strokeLinecap: 'round',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              opacity: 0.3,
              filter: `blur(4px)`
            }}
            r={normalizedRadius}
            cx={centerX}
            cy={centerY}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        )}
      </svg>
      
      {/* Center text */}
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {text || `${Math.round(animatedProgress)}%`}
          </motion.span>
        </div>
      )}
    </div>
  );
}