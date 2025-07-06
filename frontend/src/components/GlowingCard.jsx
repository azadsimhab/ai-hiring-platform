import React, { useState } from 'react';
import { Box, Paper } from '@mui/material';
import { keyframes } from '@mui/system';
import { useTheme } from '@mui/material/styles';

// Define the pulse animation for the glow effect
const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 5px 0px rgba(var(--glow-color), 0.5), 0 0 10px 2px rgba(var(--glow-color), 0.3);
  }
  50% {
    box-shadow: 0 0 10px 2px rgba(var(--glow-color), 0.7), 0 0 20px 5px rgba(var(--glow-color), 0.5);
  }
  100% {
    box-shadow: 0 0 5px 0px rgba(var(--glow-color), 0.5), 0 0 10px 2px rgba(var(--glow-color), 0.3);
  }
`;

/**
 * GlowingCard - A futuristic card component with customizable glow effects
 * 
 * @param {Object} props
 * @param {string} [props.color="primary"] - The color of the glow (primary, secondary, info, success, warning, error)
 * @param {React.ReactNode} props.children - The content of the card
 * @param {Object} [props.sx] - Additional styling using MUI's sx prop
 * @param {boolean} [props.interactive=true] - Whether the card should have hover effects
 * @param {string} [props.borderWidth="1px"] - Width of the glowing border
 * @param {number} [props.glowIntensity=0.7] - Intensity of the glow effect (0-1)
 * @param {string} [props.borderRadius="16px"] - Border radius of the card
 */
const GlowingCard = ({
  color = "primary",
  children,
  sx = {},
  interactive = true,
  borderWidth = "1px",
  glowIntensity = 0.7,
  borderRadius = "16px",
  ...rest
}) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  // Get the RGB values for the selected color from the theme
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
  
  return (
    <Paper
      elevation={0}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      sx={{
        position: 'relative',
        background: 'rgba(15, 20, 25, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius,
        border: `${borderWidth} solid rgba(${colorRGB}, ${isHovered ? 0.8 : 0.5})`,
        animation: `${pulseGlow} 3s infinite ease-in-out`,
        '--glow-color': colorRGB,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          padding: '1px',
          background: `linear-gradient(120deg, rgba(${colorRGB}, 0.2), rgba(${colorRGB}, ${glowIntensity}), rgba(${colorRGB}, 0.2))`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        },
        ...(isHovered && {
          transform: 'translateY(-2px)',
          boxShadow: `0 10px 25px -5px rgba(${colorRGB}, 0.4)`,
          '&::before': {
            background: `linear-gradient(120deg, rgba(${colorRGB}, 0.4), rgba(${colorRGB}, ${glowIntensity + 0.2}), rgba(${colorRGB}, 0.4))`,
          },
        }),
        ...sx
      }}
      {...rest}
    >
      {/* Inner content container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default GlowingCard;
