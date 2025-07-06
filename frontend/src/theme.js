import { createTheme, alpha } from '@mui/material/styles';
import { THEME as themeConstants } from './config/constants';

// ===================================================================================
//
// Filename: theme.js
//
// Description: This file defines the Material-UI theme for the application,
// implementing the futuristic 3D UI style with dark mode, neon accents,
// and glassmorphism effects as per the project requirements.
//
// ===================================================================================

const theme = createTheme({
  // --- PALETTE ---
  // Defines the color scheme for the application.
  palette: {
    mode: 'dark',
    primary: {
      main: themeConstants.PRIMARY_COLOR,
    },
    secondary: {
      main: themeConstants.SECONDARY_COLOR,
    },
    success: {
      main: themeConstants.SUCCESS_COLOR,
    },
    warning: {
      main: themeConstants.WARNING_COLOR,
    },
    error: {
      main: themeConstants.ERROR_COLOR,
    },
    info: {
      main: themeConstants.INFO_COLOR,
    },
    background: {
      default: themeConstants.BACKGROUND_GRADIENT_START,
      paper: themeConstants.GLASS_MORPHISM_BG,
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
    },
  },

  // --- TYPOGRAPHY ---
  // Defines the font styles used throughout the application.
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '0.05em' },
    h2: { fontWeight: 700, letterSpacing: '0.04em' },
    h3: { fontWeight: 600, letterSpacing: '0.03em' },
    h4: { fontWeight: 600, letterSpacing: '0.02em' },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },

  // --- COMPONENT OVERRIDES ---
  // Customizes the default styles of Material-UI components to match the futuristic theme.
  components: {
    // Global style overrides
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: `linear-gradient(180deg, ${themeConstants.BACKGROUND_GRADIENT_START} 0%, ${themeConstants.BACKGROUND_GRADIENT_END} 100%)`,
          backgroundAttachment: 'fixed',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: alpha('#000', 0.2),
        },
        '*::-webkit-scrollbar-thumb': {
          background: alpha(themeConstants.PRIMARY_COLOR, 0.5),
          borderRadius: '4px',
          '&:hover': {
            background: alpha(themeConstants.PRIMARY_COLOR, 0.7),
          },
        },
      },
    },

    // Glassmorphism effect for Paper and Card components
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Important to override default MUI behavior
          backgroundColor: themeConstants.GLASS_MORPHISM_BG,
          backdropFilter: `blur(${themeConstants.GLASS_MORPHISM_BLUR})`,
          border: `1px solid ${alpha(themeConstants.PRIMARY_COLOR, 0.2)}`,
          borderRadius: themeConstants.BORDER_RADIUS,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: themeConstants.GLASS_MORPHISM_BG,
          backdropFilter: `blur(${themeConstants.GLASS_MORPHISM_BLUR})`,
          border: `1px solid ${alpha(themeConstants.PRIMARY_COLOR, 0.2)}`,
          borderRadius: themeConstants.BORDER_RADIUS,
        },
      },
    },

    // Holographic Button style
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          border: `1px solid ${alpha(themeConstants.PRIMARY_COLOR, 0.5)}`,
          color: '#fff',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: themeConstants.PRIMARY_COLOR,
            boxShadow: `0 0 15px ${alpha(themeConstants.PRIMARY_COLOR, 0.5)}`,
            backgroundColor: alpha(themeConstants.PRIMARY_COLOR, 0.1),
          },
        },
        contained: {
          backgroundColor: alpha(themeConstants.PRIMARY_COLOR, 0.8),
          border: `1px solid ${alpha(themeConstants.PRIMARY_COLOR, 0.9)}`,
          '&:hover': {
            backgroundColor: themeConstants.PRIMARY_COLOR,
          },
        },
        outlined: {
          // Already styled well by the root override
        },
      },
    },

    // Futuristic Input Fields
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: alpha('#000', 0.2),
            backdropFilter: 'blur(5px)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(themeConstants.PRIMARY_COLOR, 0.3),
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(themeConstants.PRIMARY_COLOR, 0.7),
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: themeConstants.PRIMARY_COLOR,
              boxShadow: `0 0 10px ${alpha(themeConstants.PRIMARY_COLOR, 0.5)}`,
            },
          },
        },
      },
    },

    // Glowing Tabs
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: '3px',
          backgroundColor: themeConstants.SECONDARY_COLOR,
          boxShadow: `0 0 12px ${alpha(themeConstants.SECONDARY_COLOR, 0.8)}`,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          transition: 'color 0.3s ease',
          '&.Mui-selected': {
            color: themeConstants.SECONDARY_COLOR,
          },
          '&:hover': {
            color: themeConstants.SECONDARY_COLOR,
          },
        },
      },
    },

    // Styled Chips
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#000', 0.2),
          backdropFilter: 'blur(5px)',
        },
        outlined: {
          border: `1px solid ${alpha(themeConstants.PRIMARY_COLOR, 0.4)}`,
          color: '#e0e0e0',
        },
      },
    },

    // Futuristic Tooltip
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: themeConstants.GLASS_MORPHISM_BG,
          backdropFilter: `blur(${themeConstants.GLASS_MORPHISM_BLUR})`,
          border: `1px solid ${alpha(themeConstants.INFO_COLOR, 0.3)}`,
          borderRadius: '8px',
          fontSize: '0.875rem',
        },
        arrow: {
          color: alpha(themeConstants.INFO_COLOR, 0.3),
        },
      },
    },
  },
});

export default theme;
