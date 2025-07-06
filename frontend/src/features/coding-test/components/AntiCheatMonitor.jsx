import React, { useEffect, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertTitle, Box, Typography, keyframes } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { WarningAmber as WarningIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import { logAntiCheatEvent } from '../api/codingTestApi';

// Keyframes for the pulsing warning effect
const pulseWarning = keyframes`
  0% {
    box-shadow: 0 0 0 0 ${alpha('#ff9800', 0.7)};
  }
  70% {
    box-shadow: 0 0 0 10px ${alpha('#ff9800', 0)};
  }
  100% {
    box-shadow: 0 0 0 0 ${alpha('#ff9800', 0)};
  }
`;

/**
 * AntiCheatMonitor - A React component that monitors for potential cheating activities
 * like tab switching and paste events. It logs these events to the backend API
 * and provides appropriate warnings to the user.
 *
 * @param {Object} props
 * @param {number} props.sessionId - The ID of the current coding test session.
 * @param {boolean} [props.isActive=true] - Whether the monitoring should be active.
 */
const AntiCheatMonitor = ({ sessionId, isActive = true }) => {
  const theme = useTheme();
  const [warning, setWarning] = useState({
    open: false,
    message: '',
    severity: 'warning',
  });

  /**
   * Handles the visibility change event (tab switching).
   * When the page is hidden, it logs a 'focus_change' event and shows a warning.
   */
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isActive) {
      console.warn('Anti-cheat: Tab focus lost.');
      logAntiCheatEvent({ session_id: sessionId, event_type: 'focus_change' });
      setWarning({
        open: true,
        message: 'Switching tabs or minimizing the window is monitored and may impact your evaluation.',
        severity: 'warning',
      });
    }
  }, [sessionId, isActive]);

  /**
   * Handles the paste event.
   * Logs a 'paste' event and shows an informational notification.
   */
  const handlePaste = useCallback((event) => {
    if (isActive) {
      console.info('Anti-cheat: Paste event detected.');
      logAntiCheatEvent({ session_id: sessionId, event_type: 'paste' });
      setWarning({
        open: true,
        message: 'Pasting content into the test environment is logged.',
        severity: 'info',
      });
    }
  }, [sessionId, isActive]);

  /**
   * Attaches and cleans up event listeners for visibility change and paste events.
   * The effect runs only when the `isActive` prop changes.
   */
  useEffect(() => {
    if (isActive) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('paste', handlePaste);
      console.log('Anti-cheat monitor activated for session:', sessionId);
    } else {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('paste', handlePaste);
      console.log('Anti-cheat monitor deactivated.');
    }

    // Cleanup function to remove listeners when the component unmounts or `isActive` becomes false.
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('paste', handlePaste);
    };
  }, [isActive, handleVisibilityChange, handlePaste, sessionId]);

  /**
   * Handles closing the warning snackbar.
   */
  const handleCloseWarning = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setWarning((prev) => ({ ...prev, open: false }));
  };

  // This component primarily works in the background. Its only UI is the warning snackbar.
  return (
    <AnimatePresence>
      {warning.open && (
        <Snackbar
          open={warning.open}
          autoHideDuration={8000}
          onClose={handleCloseWarning}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          component={motion.div}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          <Alert
            onClose={handleCloseWarning}
            severity={warning.severity}
            variant="filled"
            iconMapping={{
              warning: <WarningIcon sx={{ animation: `${pulseWarning} 2s infinite` }} />,
            }}
            sx={{
              width: '100%',
              boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.37)}`,
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor:
                warning.severity === 'warning'
                  ? alpha(theme.palette.warning.main, 0.5)
                  : alpha(theme.palette.info.main, 0.5),
              backgroundColor:
                warning.severity === 'warning'
                  ? alpha(theme.palette.warning.dark, 0.8)
                  : alpha(theme.palette.info.dark, 0.8),
            }}
          >
            <AlertTitle>
              {warning.severity === 'warning' ? 'Warning' : 'Notification'}
            </AlertTitle>
            {warning.message}
          </Alert>
        </Snackbar>
      )}
    </AnimatePresence>
  );
};

export default AntiCheatMonitor;
