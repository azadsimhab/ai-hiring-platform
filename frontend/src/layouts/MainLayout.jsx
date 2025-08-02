import React from 'react';
import { FloatingNavigation, MobileNavigation } from '../components/navigation/FloatingNavigation';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-900 relative">
      {/* Futuristic Background */}
      <div className="fixed inset-0 bg-mesh-gradient opacity-10 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-dark-900/90 via-dark-900/95 to-dark-900 pointer-events-none"></div>
      
      {/* Floating Navigation */}
      <FloatingNavigation />
      <MobileNavigation />
      
      {/* Main Content */}
      <main className="relative z-10 pl-0 md:pl-20">
        {children}
      </main>
    </div>
  );
};

export default MainLayout; 