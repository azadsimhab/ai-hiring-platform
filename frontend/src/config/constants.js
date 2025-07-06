// ===================================================================================
//
// Filename: constants.js
//
// Description: This file defines application-wide constants, including API endpoints,
// theme settings for the futuristic UI, and other global configuration variables.
//
// ===================================================================================

// --- API Configuration ---
// Use the environment variable for the API base URL if it's set (e.g., in production).
// Otherwise, fall back to a default for local development.
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// --- Application Information ---
export const APP_NAME = 'AI Hiring Platform';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'Factory';

// --- UI & Theme Constants ---
// Defines the color palette and styling for the futuristic 3D UI.
export const THEME = {
  PRIMARY_COLOR: '#0064ff',     // A vibrant, futuristic blue
  SECONDARY_COLOR: '#9c27b0',   // A deep, neon purple
  SUCCESS_COLOR: '#4caf50',     // A clear green for success states
  WARNING_COLOR: '#ff9800',     // A bright orange for warnings
  ERROR_COLOR: '#f44336',       // A sharp red for errors
  INFO_COLOR: '#03a9f4',        // A light, informative blue
  BACKGROUND_GRADIENT_START: '#0a0f18', // Dark space blue
  BACKGROUND_GRADIENT_END: '#1a1f28',   // Deeper space blue
  GLASS_MORPHISM_BG: 'rgba(15, 20, 25, 0.6)', // Semi-transparent background for cards
  GLASS_MORPHISM_BLUR: '10px', // Blur effect for glassmorphism
  GLOW_INTENSITY: 0.7,         // Default intensity for glowing effects
  BORDER_RADIUS: '16px',       // Standard border radius for cards and containers
};

// --- Animation Constants ---
// Pre-defined variants for Framer Motion to ensure consistent animations.
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 },
  },
  slideInUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  glowPulse: {
    animate: {
      boxShadow: [
        '0 0 5px 0px rgba(var(--glow-color), 0.5), 0 0 10px 2px rgba(var(--glow-color), 0.3)',
        '0 0 10px 2px rgba(var(--glow-color), 0.7), 0 0 20px 5px rgba(var(--glow-color), 0.5)',
        '0 0 5px 0px rgba(var(--glow-color), 0.5), 0 0 10px 2px rgba(var(--glow-color), 0.3)',
      ],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// --- Global Application Settings ---
export const DEFAULT_PAGE_SIZE = 10; // Default number of items per page for lists
export const MAX_FILE_UPLOAD_SIZE_MB = 10; // Max size for resume uploads in MB
export const AUTH_TOKEN_KEY = 'hiringPlatformAuthToken'; // Key for storing the auth token in local storage
