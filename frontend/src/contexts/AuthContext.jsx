import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import axios from 'axios';
import { AUTH_TOKEN_KEY, API_BASE_URL } from '../config/constants';

// ===================================================================================
//
// Filename: AuthContext.jsx
//
// Description: This file creates the authentication context and provider for the application.
// It handles user state, session management (login, logout, registration), and
// initializes the user session from localStorage on application startup.
//
// ===================================================================================

// --- Mock API Functions ---
// In a real application, these would be in a separate `authApi.js` file.
// For this example, they are mocked here to demonstrate the flow.
const mockApi = {
  login: async (email, password) => {
    // Simulate API call
    if (email === 'user@factory.ai' && password === 'password') {
      const token = 'mock-jwt-token-string';
      const user = {
        id: '1',
        name: 'Erik',
        email: 'user@factory.ai',
        role: 'Hiring Manager',
        avatar: '/static/mock-images/avatar_default.jpg',
      };
      return { token, user };
    }
    throw new Error('Invalid credentials');
  },
  register: async (name, email, password) => {
    // Simulate API call
    const token = 'mock-jwt-token-string-for-new-user';
    const user = {
      id: '2',
      name,
      email,
      role: 'User',
      avatar: '/static/mock-images/avatar_default.jpg',
    };
    return { token, user };
  },
  getMe: async (token) => {
    // Simulate validating a token and fetching user data
    if (token === 'mock-jwt-token-string' || token === 'mock-jwt-token-string-for-new-user') {
      return {
        id: '1',
        name: 'Erik',
        email: 'user@factory.ai',
        role: 'Hiring Manager',
        avatar: '/static/mock-images/avatar_default.jpg',
      };
    }
    throw new Error('Invalid token');
  },
};

// --- Helper function to set the authorization header ---
const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

// 1. Create the Authentication Context
const AuthContext = createContext(null);

// 2. Create the Authentication Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // The `initialize` function runs once on app load to check for an existing session.
  const initialize = useCallback(async () => {
    try {
      const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

      if (token) {
        setAuthHeader(token);
        // Validate the token by fetching the user profile
        const currentUser = await mockApi.getMe(token);
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Initialization failed:', error);
      // If token is invalid, clear the state
      setUser(null);
      setIsAuthenticated(false);
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      setAuthHeader(null);
    } finally {
      // Signal that initialization is complete
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // `login` function handles user sign-in
  const login = useCallback(async (email, password) => {
    const { token, user: loggedInUser } = await mockApi.login(email, password);
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    setAuthHeader(token);
    setUser(loggedInUser);
    setIsAuthenticated(true);
  }, []);

  // `register` function handles new user sign-up
  const register = useCallback(async (name, email, password) => {
    const { token, user: registeredUser } = await mockApi.register(name, email, password);
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    setAuthHeader(token);
    setUser(registeredUser);
    setIsAuthenticated(true);
  }, []);

  // `logout` function handles user sign-out
  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthHeader(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isInitialized,
      login,
      logout,
      register,
    }),
    [user, isAuthenticated, isInitialized, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
