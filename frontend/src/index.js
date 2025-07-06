import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import './index.css'; // For global styles, fonts, and animations

// Get the root element from the DOM where the React app will be mounted.
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Render the application.
// The App is wrapped with all the necessary providers:
// - React.StrictMode: For highlighting potential problems in the app during development.
// - AuthProvider: Provides authentication state and functions to the entire component tree.
// - ThemeProvider: Applies the custom futuristic MUI theme.
// - CssBaseline: Provides a consistent styling baseline across browsers.
// - BrowserRouter: Enables client-side routing for the single-page application.
// - Toaster: A provider for displaying toast notifications.
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 20, 25, 0.8)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                border: '1px solid rgba(0, 100, 255, 0.3)',
                boxShadow: '0 0 15px rgba(0, 100, 255, 0.2)',
              },
              success: {
                iconTheme: {
                  primary: '#4caf50', // success green
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f44336', // error red
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
