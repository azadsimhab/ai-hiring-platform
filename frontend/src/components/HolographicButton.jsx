import React, { useState } from 'react';
import { Button, ButtonProps, alpha } from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { useTheme } from '@mui/material/styles';

// Define animations
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 5px 0px rgba(var(--button-rgb), 0.5), 0 0 10px 2px rgba(var(--button-rgb), 0.3);
  }
  50% {
    box-shadow: 0 0 10px 2px rgba(var(--button-rgb), 0.7), 0 0 20px 5px rgba(var(--button-rgb), 0.5);
  }
  100% {
    box-shadow: 0 0 5px 0px rgba(var(--button-rgb), 0.5), 0 0 10px 2px rgba(var(--button-rgb), 0.3);
  }
`;

const shimmerAnimation = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Styled button component
const StyledButton = styled(Button)(({ theme, color = 'primary', glowIntensity = 0.7, disabled }) => {
  // Get color RGB values for different button colors
  const getColorRGB = () => {
    const colorMap = {
      primary: '0, 100, 255',     // Blue
      secondary: '156, 39, 176',  // Purple
      info: '3, 169, 244',        // Light Blue
      success: '76, 175, 80',     // Green
      warning: '255, 152, 0',     // Orange
      error: '244, 67, 54',       // Red
    };
    
    return colorMap[color] || colorMap.primary;
  };
  
  const colorRGB = getColorRGB();
  
  return {
    '--button-rgb': colorRGB,
    position: 'relative',
    borderRadius: '12px',
    padding: '10px 24px',
    fontSize: '0.9rem',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'none',
    color: disabled ? alpha(theme.palette.common.white, 0.4) : theme.palette.common.white,
    background: disabled 
      ? 'rgba(30, 35, 45, 0.6)'
      : `linear-gradient(135deg, 
          rgba(${colorRGB}, 0.1) 0%, 
          rgba(${colorRGB}, 0.2) 50%, 
          rgba(${colorRGB}, 0.1) 100%)`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${disabled ? 'rgba(80, 80, 80, 0.3)' : `rgba(${colorRGB}, 0.5)`}`,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    animation: disabled ? 'none' : `${pulseAnimation} 3s infinite ease-in-out`,
    
    // Glow effect
    boxShadow: disabled 
      ? 'none' 
      : `0 0 10px 0px rgba(${colorRGB}, ${glowIntensity * 0.3})`,
      
    // Disabled state
    '&.Mui-disabled': {
      background: 'rgba(30, 35, 45, 0.6)',
      color: alpha(theme.palette.common.white, 0.4),
      boxShadow: 'none',
      animation: 'none',
    },
    
    // Hover state
    '&:hover': {
      background: disabled 
        ? 'rgba(30, 35, 45, 0.6)'
        : `linear-gradient(135deg, 
            rgba(${colorRGB}, 0.2) 0%, 
            rgba(${colorRGB}, 0.3) 50%, 
            rgba(${colorRGB}, 0.2) 100%)`,
      transform: disabled ? 'none' : 'translateY(-2px)',
      boxShadow: disabled 
        ? 'none' 
        : `0 10px 20px -5px rgba(${colorRGB}, ${glowIntensity * 0.5})`,
    },
    
    // Active state
    '&:active': {
      transform: disabled ? 'none' : 'translateY(1px)',
      boxShadow: disabled 
        ? 'none' 
        : `0 5px 10px -3px rgba(${colorRGB}, ${glowIntensity * 0.4})`,
    },
    
    // Before pseudo-element for border glow
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 'inherit',
      padding: '1px',
      background: disabled 
        ? 'rgba(80, 80, 80, 0.3)'
        : `linear-gradient(90deg, 
            rgba(${colorRGB}, 0.3), 
            rgba(${colorRGB}, ${glowIntensity}), 
            rgba(${colorRGB}, 0.3))`,
      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      maskComposite: 'exclude',
      pointerEvents: 'none',
    },
    
    // After pseudo-element for shimmer effect
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: disabled 
        ? 'none'
        : `linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.1), 
            transparent)`,
      backgroundSize: '200% 100%',
      animation: disabled ? 'none' : `${shimmerAnimation} 3s infinite linear`,
      pointerEvents: 'none',
    },
  };
});

/**
 * HolographicButton - A futuristic button component with holographic effects
 * 
 * @param {Object} props
 * @param {string} [props.color="primary"] - Button color (primary, secondary, info, success, warning, error)
 * @param {number} [props.glowIntensity=0.7] - Intensity of the glow effect (0-1)
 * @param {React.ReactNode} props.children - Button content
 * @param {function} [props.onClick] - Click handler
 * @param {boolean} [props.disabled] - Whether the button is disabled
 * @param {string} [props.size] - Button size (small, medium, large)
 * @param {React.ReactNode} [props.startIcon] - Icon to display at the start of the button
 * @param {React.ReactNode} [props.endIcon] - Icon to display at the end of the button
 */
const HolographicButton = ({
  color = 'primary',
  glowIntensity = 0.7,
  children,
  ...props
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <StyledButton
      color={color}
      glowIntensity={glowIntensity}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disableRipple
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default HolographicButton;
