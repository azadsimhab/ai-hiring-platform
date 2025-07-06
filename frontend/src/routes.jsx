import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Guards
import AuthGuard from './guards/AuthGuard';
import GuestGuard from './guards/GuestGuard';

// Pages
import Dashboard from './features/dashboard/DashboardPage';
import HiringRequestsPage from './features/hiring-requests/HiringRequestsPage';
import HiringRequestDetailsPage from './features/hiring-requests/HiringRequestDetailsPage';
import JDGeneratorPage from './features/jd-generator/JDGeneratorPage';
import ResumeScannerPage from './features/resume-scanner/ResumeScannerPage';
import InterviewPage from './features/interview/InterviewPage';
import CodingTestPage from './features/coding-test/CodingTestPage';
import ReportsPage from './features/reports/ReportsPage';
import SettingsPage from './features/settings/SettingsPage';
import MultimodalScreeningPage from './features/multimodal-screening/MultimodalScreeningPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import NotFoundPage from './features/error/NotFoundPage';

/**
 * Application routes configuration
 */
export default function Router() {
  return useRoutes([
    // Protected routes (require authentication)
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        { path: '/', element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        
        // Hiring Requests routes
        { path: 'hiring-requests', element: <HiringRequestsPage /> },
        { path: 'hiring-requests/:id', element: <HiringRequestDetailsPage /> },
        
        // Job Description Generator routes
        { path: 'job-descriptions', element: <JDGeneratorPage /> },
        { path: 'job-descriptions/:id', element: <JDGeneratorPage /> },
        { path: 'hiring-requests/:hiringRequestId/job-descriptions', element: <JDGeneratorPage /> },
        { path: 'hiring-requests/:hiringRequestId/job-descriptions/:id', element: <JDGeneratorPage /> },
        
        // Resume Scanner routes
        { path: 'resume-scanner', element: <ResumeScannerPage /> },
        { path: 'resume-scanner/:resumeId', element: <ResumeScannerPage /> },
        { path: 'job-descriptions/:jobDescriptionId/resumes', element: <ResumeScannerPage /> },
        { path: 'job-descriptions/:jobDescriptionId/resumes/:resumeId', element: <ResumeScannerPage /> },
        
        // Interview routes
        { path: 'interviews', element: <InterviewPage /> },
        { path: 'interviews/:id', element: <InterviewPage /> },
        
        // Coding Test routes
        { path: 'coding-tests', element: <CodingTestPage /> },
        { path: 'coding-tests/:id', element: <CodingTestPage /> },
        
        // Multimodal Screening routes
        { path: 'screening', element: <MultimodalScreeningPage /> },
        { path: 'screening/:candidateId/:jobDescriptionId', element: <MultimodalScreeningPage /> },

        // Reports routes
        { path: 'reports', element: <ReportsPage /> },
        { path: 'reports/:type', element: <ReportsPage /> },
        
        // Settings
        { path: 'settings', element: <SettingsPage /> },
      ],
    },
    
    // Auth routes (for non-authenticated users)
    {
      path: 'auth',
      element: (
        <GuestGuard>
          <AuthLayout />
        </GuestGuard>
      ),
      children: [
        { path: 'login', element: <LoginPage /> },
        { path: 'register', element: <RegisterPage /> },
        { path: 'forgot-password', element: <ForgotPasswordPage /> },
      ],
    },
    
    // Error pages
    { path: '404', element: <NotFoundPage /> },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
