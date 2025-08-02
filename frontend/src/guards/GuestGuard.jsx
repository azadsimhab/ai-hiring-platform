import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GuestGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GuestGuard; 