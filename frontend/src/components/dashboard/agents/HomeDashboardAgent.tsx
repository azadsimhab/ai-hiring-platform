import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { ProgressRing } from '../../ui/ProgressRing';
import { HolographicButton } from '../../ui/HolographicButton';

interface HomeDashboardAgentProps {
  user: any;
  isActive: boolean;
  onStatusChange: (status: string) => void;
}

export function HomeDashboardAgent({ user, isActive, onStatusChange }: HomeDashboardAgentProps) {
  const [metrics, setMetrics] = useState({
    totalRequests: 156,
    activeScreenings: 23,
    completedHires: 48,
    successRate: 87
  });

  const [activities, setActivities] = useState([
    { id: 1, action: 'New hiring request created', time: '2 min ago', type: 'success' },
    { id: 2, action: 'Resume screening completed', time: '5 min ago', type: 'info' },
    { id: 3, action: 'Interview scheduled', time: '12 min ago', type: 'warning' },
    { id: 4, action: 'Candidate shortlisted', time: '1 hour ago', type: 'success' }
  ]);

  useEffect(() => {
    if (isActive) {
      onStatusChange('active');
    }
  }, [isActive, onStatusChange]);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">🏠</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">
                Home Dashboard Agent
              </h2>
              <p className="text-white/70 mt-2">
                Central command for all hiring activities and agent monitoring
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-400 mb-2">
                <AnimatedCounter value={metrics.totalRequests} />
              </div>
              <div className="text-white/60 text-sm">Total Requests</div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">
                <AnimatedCounter value={metrics.activeScreenings} />
              </div>
              <div className="text-white/60 text-sm">Active Screenings</div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                <AnimatedCounter value={metrics.completedHires} />
              </div>
              <div className="text-white/60 text-sm">Completed Hires</div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard>
            <div className="text-center">
              <ProgressRing
                progress={metrics.successRate}
                size={80}
                strokeWidth={8}
                className="mb-2"
              />
              <div className="text-white/60 text-sm">Success Rate</div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4 text-primary-400">
              Recent Activities
            </h3>
            
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getActivityColor(activity.type) }}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-white/90">{activity.action}</div>
                    <div className="text-xs text-white/60">{activity.time}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard>
            <h3 className="text-xl font-semibold mb-4 text-primary-400">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <HolographicButton
                variant="primary"
                className="w-full"
                onClick={() => {}}
              >
                📝 Create New Hiring Request
              </HolographicButton>
              
              <HolographicButton
                variant="secondary"
                className="w-full"
                onClick={() => {}}
              >
                📊 Scan New Resumes
              </HolographicButton>
              
              <HolographicButton
                variant="success"
                className="w-full"
                onClick={() => {}}
              >
                📅 Schedule Interviews
              </HolographicButton>
              
              <HolographicButton
                variant="warning"
                className="w-full"
                onClick={() => {}}
              >
                🎥 Start AI Screening
              </HolographicButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}