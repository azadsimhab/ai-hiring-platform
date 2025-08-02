import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Navigation Icons
const NavIcons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  hiring: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
    </svg>
  ),
  resume: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  coding: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  screening: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  jd: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  profile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
};

// Live Activity Indicator
function LiveIndicator({ count = 0, color = "emerald" }: { count?: number; color?: string }) {
  return (
    <motion.div
      className={`absolute -top-1 -right-1 w-5 h-5 bg-${color}-500 rounded-full flex items-center justify-center text-xs font-bold`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500 }}
    >
      <motion.div
        className={`absolute inset-0 bg-${color}-500 rounded-full animate-ping opacity-75`}
      />
      <span className="relative z-10 text-white text-xs">{count}</span>
    </motion.div>
  );
}

// Navigation Item Component
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  liveCount?: number;
  onClick: () => void;
}

function NavItem({ icon, label, path, isActive, liveCount, onClick }: NavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
        ${isActive 
          ? 'bg-primary-500/20 text-primary-400 shadow-glow' 
          : 'text-white/70 hover:text-white hover:bg-white/10'
        }
      `}
      whileHover={{ scale: 1.05, x: 5 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative">
        {icon}
        {liveCount && liveCount > 0 && <LiveIndicator count={liveCount} />}
      </div>
      
      {/* Label with slide animation */}
      <AnimatePresence>
        {(isHovered || isActive) && (
          <motion.span
            className="font-medium whitespace-nowrap"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute left-0 top-1/2 w-1 h-8 bg-primary-400 rounded-r-full -translate-y-1/2"
          layoutId="activeIndicator"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      
      {/* Hover glow effect */}
      {isHovered && !isActive && (
        <motion.div
          className="absolute inset-0 bg-white/5 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.button>
  );
}

// AI Status Indicator
function AIStatus() {
  const [status, setStatus] = useState<'active' | 'processing' | 'idle'>('active');
  
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses: ('active' | 'processing' | 'idle')[] = ['active', 'processing', 'idle'];
      setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    active: { color: 'emerald', label: 'AI Active', pulse: true },
    processing: { color: 'electric', label: 'Processing', pulse: true },
    idle: { color: 'amber', label: 'Idle', pulse: false }
  };

  const config = statusConfig[status];

  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative">
        <motion.div
          className={`w-2 h-2 bg-${config.color}-400 rounded-full`}
          animate={config.pulse ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {config.pulse && (
          <motion.div
            className={`absolute inset-0 bg-${config.color}-400 rounded-full animate-ping opacity-75`}
          />
        )}
      </div>
      <span className="text-xs text-white/70">{config.label}</span>
    </motion.div>
  );
}

// Main Floating Navigation Component
export function FloatingNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Navigation items with live counts (simulated)
  const navItems = [
    { 
      icon: NavIcons.dashboard, 
      label: 'Dashboard', 
      path: '/dashboard', 
      liveCount: 3 
    },
    { 
      icon: NavIcons.hiring, 
      label: 'Hiring Pipeline', 
      path: '/hiring-requests', 
      liveCount: 7 
    },
    { 
      icon: NavIcons.resume, 
      label: 'Resume Scanner', 
      path: '/resume-scanner', 
      liveCount: 12 
    },
    { 
      icon: NavIcons.coding, 
      label: 'Coding Tests', 
      path: '/coding-test', 
      liveCount: 2 
    },
    { 
      icon: NavIcons.screening, 
      label: 'Screening', 
      path: '/multimodal-screening', 
      liveCount: 0 
    },
    { 
      icon: NavIcons.jd, 
      label: 'JD Generator', 
      path: '/jd-generator', 
      liveCount: 0 
    }
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      className={`
        fixed left-6 top-1/2 -translate-y-1/2 z-50
        glass-strong rounded-2xl p-4 shadow-glass-lg
        transition-all duration-300
        ${scrollY > 100 ? 'backdrop-blur-xl' : ''}
      `}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      style={{
        background: `rgba(15, 23, 42, ${Math.min(0.8 + scrollY * 0.001, 0.95)})`
      }}
    >
      {/* Logo/Brand */}
      <motion.div
        className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10"
        animate={{ width: isExpanded ? 'auto' : '40px' }}
      >
        <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
          <motion.span
            className="text-white font-bold text-sm"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            AI
          </motion.span>
        </div>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <h2 className="text-white font-semibold text-sm whitespace-nowrap">
                Hiring Platform
              </h2>
              <p className="text-white/50 text-xs whitespace-nowrap">
                AI-Powered
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Navigation Items */}
      <div className="space-y-2 mb-6">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isActive={location.pathname === item.path}
            liveCount={item.liveCount}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>

      {/* AI Status */}
      <div className="mb-4">
        <AIStatus />
      </div>

      {/* User Profile & Logout */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <NavItem
          icon={NavIcons.profile}
          label={user?.email || 'Profile'}
          path="/profile"
          isActive={false}
          onClick={() => {/* Handle profile */}}
        />
        
        <NavItem
          icon={NavIcons.logout}
          label="Logout"
          path=""
          isActive={false}
          onClick={handleLogout}
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-2 top-4 w-1 h-16 bg-gradient-to-b from-primary-400 to-electric-400 rounded-full opacity-50"></div>
      <div className="absolute -right-1 top-8 w-0.5 h-8 bg-gradient-to-b from-electric-400 to-emerald-400 rounded-full opacity-30"></div>
    </motion.nav>
  );
}

// Compact Mobile Navigation (Bottom)
export function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const mobileNavItems = [
    { icon: NavIcons.dashboard, path: '/dashboard' },
    { icon: NavIcons.hiring, path: '/hiring-requests' },
    { icon: NavIcons.resume, path: '/resume-scanner' },
    { icon: NavIcons.coding, path: '/coding-test' },
  ];

  return (
    <motion.nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="glass-strong rounded-2xl p-2 shadow-glass-lg flex gap-2">
        {mobileNavItems.map((item, index) => (
          <motion.button
            key={item.path}
            className={`
              relative p-3 rounded-xl transition-all duration-300
              ${location.pathname === item.path 
                ? 'bg-primary-500/20 text-primary-400 shadow-glow' 
                : 'text-white/70 hover:text-white hover:bg-white/10'
              }
            `}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            {location.pathname === item.path && (
              <motion.div
                className="absolute -top-1 left-1/2 w-2 h-2 bg-primary-400 rounded-full -translate-x-1/2"
                layoutId="mobileActiveIndicator"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
}