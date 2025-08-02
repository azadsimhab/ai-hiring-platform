import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { HolographicButton } from '../ui/HolographicButton';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { ProgressRing } from '../ui/ProgressRing';
import { PureCSSBackground } from '../ui/PureCSSBackground';
import { getScreenInfo } from '../../utils/deviceDetection';

// Agent Tab Components (placeholder for now)
import { HomeDashboardAgent } from './agents/HomeDashboardAgent';
import { HiringRequestAgent } from './agents/HiringRequestAgent';
import { JDGenerationAgent } from './agents/JDGenerationAgent';
import { ResumeScannerAgent } from './agents/ResumeScannerAgent';
import { SchedulingAgent } from './agents/SchedulingAgent';
import { ScreeningAgent } from './agents/ScreeningAgent';
import { ShortlistAgent } from './agents/ShortlistAgent';
import { AnalyticsAgent } from './agents/AnalyticsAgent';
import { SettingsAgent } from './agents/SettingsAgent';

interface AgentTab {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'active' | 'inactive' | 'processing';
  component: React.ComponentType<any>;
}

const agentTabs: AgentTab[] = [
  {
    id: 'home',
    name: 'Home Dashboard',
    icon: '🏠',
    description: 'Central command for all hiring activities',
    status: 'active',
    component: HomeDashboardAgent
  },
  {
    id: 'hiring-request',
    name: 'Hiring Request',
    icon: '📝',
    description: 'Intelligent hiring request creation',
    status: 'active',
    component: HiringRequestAgent
  },
  {
    id: 'jd-generation',
    name: 'JD Generation',
    icon: '📄',
    description: 'AI-powered job description creation',
    status: 'active',
    component: JDGenerationAgent
  },
  {
    id: 'resume-scanner',
    name: 'Resume Scanner',
    icon: '📊',
    description: 'Intelligent resume analysis and scoring',
    status: 'active',
    component: ResumeScannerAgent
  },
  {
    id: 'scheduling',
    name: 'Scheduling',
    icon: '📅',
    description: 'Autonomous interview scheduling',
    status: 'active',
    component: SchedulingAgent
  },
  {
    id: 'screening',
    name: 'AI Screening',
    icon: '🎥',
    description: 'Multimodal AI interviewer',
    status: 'active',
    component: ScreeningAgent
  },
  {
    id: 'shortlist',
    name: 'Final Shortlist',
    icon: '✅',
    description: 'Final candidate selection',
    status: 'active',
    component: ShortlistAgent
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: '📈',
    description: 'Comprehensive HR analytics',
    status: 'active',
    component: AnalyticsAgent
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    description: 'System configuration',
    status: 'active',
    component: SettingsAgent
  }
];

interface AgentDashboardProps {
  user: any;
  onLogout: () => void;
}

export function AgentDashboard({ user, onLogout }: AgentDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenInfo, setScreenInfo] = useState(getScreenInfo());

  const activeAgent = agentTabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeAgent?.component;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const newScreenInfo = getScreenInfo();
      setScreenInfo(newScreenInfo);
      
      // Close mobile menu on desktop
      if (newScreenInfo.deviceType === 'desktop') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Optimized tab switching with loading state
  const handleTabSwitch = useCallback((tabId: string) => {
    if (tabId === activeTab) return;
    
    setIsLoading(true);
    setActiveTab(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu on tab switch
    
    // Simulate component loading
    setTimeout(() => setIsLoading(false), 300);
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'processing': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <PureCSSBackground>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-4xl font-display font-bold text-hologram mb-2">
                AI Hiring Platform
              </h1>
              <p className="text-white/70">
                Welcome back, {user?.name || 'User'} • {user?.company || 'Company'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-white/60">Active Agents</div>
                <div className="text-xl font-bold text-emerald-400">
                  <AnimatedCounter value={agentTabs.filter(t => t.status === 'active').length} />
                </div>
              </div>
              
              <HolographicButton
                variant="secondary"
                onClick={onLogout}
                size="sm"
              >
                Logout
              </HolographicButton>
            </div>
          </motion.div>

          {/* Mobile Menu Toggle */}
          {screenInfo.deviceType === 'mobile' && (
            <div className="mb-4 lg:hidden">
              <HolographicButton
                variant="secondary"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-full flex items-center justify-between"
              >
                <span>📱 {activeAgent?.name || 'Select Agent'}</span>
                <span className={`transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}>
                  ⌄
                </span>
              </HolographicButton>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Agent Navigation */}
            <div className={`lg:col-span-1 ${screenInfo.deviceType === 'mobile' && !isMobileMenuOpen ? 'hidden' : ''}`}>
              <GlassCard className="sticky top-8">
                <h3 className="text-lg font-semibold mb-4 text-primary-400">
                  AI Agents
                </h3>
                
                <div className="space-y-2">
                  {agentTabs.map((tab, index) => (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-primary-500/20 border-primary-400 shadow-glow'
                          : 'bg-white/5 hover:bg-white/10 border-transparent'
                      } border backdrop-blur-sm hover:scale-[1.02] transform`}
                      onClick={() => handleTabSwitch(tab.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`transition-all ${screenInfo.deviceType === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
                          {tab.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold ${screenInfo.deviceType === 'mobile' ? 'text-xs' : 'text-sm'} truncate`}>
                            {tab.name}
                          </div>
                          {screenInfo.deviceType !== 'mobile' && (
                            <div className="text-xs text-white/60 mt-1 line-clamp-2">
                              {tab.description}
                            </div>
                          )}
                        </div>
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getStatusColor(tab.status) }}
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-4">
              {isLoading ? (
                <GlassCard className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
                  <p className="text-white/70">Loading {activeAgent?.name}...</p>
                </GlassCard>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                    className="h-full"
                  >
                    {ActiveComponent && (
                      <ActiveComponent
                        user={user}
                        isActive={true}
                        screenInfo={screenInfo}
                        onStatusChange={(status: string) => {
                          // Update agent status with more sophisticated handling
                          const agentIndex = agentTabs.findIndex(tab => tab.id === activeTab);
                          if (agentIndex !== -1) {
                            agentTabs[agentIndex].status = status as any;
                          }
                          console.log(`Agent ${activeTab} status: ${status}`);
                        }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </PureCSSBackground>
    </div>
  );
}