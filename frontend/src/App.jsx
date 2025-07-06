import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

import Router from './routes';
import { useAuth } from './hooks/useAuth';
import FuturisticBackground from './components/FuturisticBackground';
import Logo from './components/Logo';

// ===================================================================================
//
// ErrorBoundary Component
//
// Catches JavaScript errors anywhere in its child component tree, logs those errors,
// and displays a fallback UI instead of the component tree that crashed.
//
// ===================================================================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render any custom fallback UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            textAlign: 'center',
            p: 3,
            zIndex: 10,
            position: 'relative',
          }}
        >
          <Paper
            sx={{
              p: 4,
              background: 'rgba(255, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: 4,
            }}
          >
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Something went wrong.
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              An unexpected error occurred. Please try refreshing the page.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// ===================================================================================
//
// LoadingScreen Component
//
// Displays a full-screen loading indicator, used while the application is
// performing initial checks, such as verifying authentication status.
//
// ===================================================================================
const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
    }}
  >
    <Logo sx={{ height: 60, mb: 4 }} />
    <CircularProgress size={40} />
    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
      Initializing Platform...
    </Typography>
  </Box>
);

// ===================================================================================
//
// Main App Component
//
// The root component of the application. It handles:
// - Displaying a loading screen during auth initialization.
// - Setting up the application-wide error boundary.
// - Rendering the global futuristic background.
// - Managing routing via the `useRoutes` hook.
//
// ===================================================================================
function App() {
  const { isInitialized } = useAuth();
  const routing = useRoutes(Router().props.children);

  return (
    <ErrorBoundary>
      <FuturisticBackground />
      <Suspense fallback={<LoadingScreen />}>
        {isInitialized ? routing : <LoadingScreen />}
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
