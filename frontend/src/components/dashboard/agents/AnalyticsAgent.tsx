import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { ProgressRing } from '../../ui/ProgressRing';

export function AnalyticsAgent({ user, isActive, onStatusChange }: any) {
  const metrics = {
    totalHires: 48,
    averageTimeToHire: 12,
    costPerHire: 2500,
    successRate: 87
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">📈</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">Analytics Dashboard Agent</h2>
              <p className="text-white/70 mt-2">Comprehensive HR analytics and performance insights</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400 mb-2">
              <AnimatedCounter value={metrics.totalHires} />
            </div>
            <div className="text-white/60 text-sm">Total Hires</div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-400 mb-2">
              <AnimatedCounter value={metrics.averageTimeToHire} suffix=" days" />
            </div>
            <div className="text-white/60 text-sm">Avg Time to Hire</div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400 mb-2">
              $<AnimatedCounter value={metrics.costPerHire} />
            </div>
            <div className="text-white/60 text-sm">Cost per Hire</div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-center">
            <ProgressRing progress={metrics.successRate} size={80} strokeWidth={8} className="mb-2" />
            <div className="text-white/60 text-sm">Success Rate</div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-primary-400 mb-4">Hiring Funnel</h3>
          <div className="space-y-3">
            {[
              { stage: 'Applications', count: 1200, percentage: 100 },
              { stage: 'Screening', count: 480, percentage: 40 },
              { stage: 'Interviews', count: 120, percentage: 10 },
              { stage: 'Offers', count: 60, percentage: 5 },
              { stage: 'Hired', count: 48, percentage: 4 }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-white/70">{item.stage}</div>
                <div className="flex-1 bg-white/10 rounded-full h-6 relative">
                  <div 
                    className="bg-gradient-to-r from-primary-400 to-emerald-400 h-6 rounded-full transition-all duration-1000"
                    style={{ width: `${item.percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold">
                    {item.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-primary-400 mb-4">Agent Performance</h3>
          <div className="space-y-3">
            {[
              { agent: 'Resume Scanner', performance: 94 },
              { agent: 'AI Screening', performance: 89 },
              { agent: 'Scheduling', performance: 96 },
              { agent: 'JD Generation', performance: 91 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-white/80">{item.agent}</span>
                <div className="flex items-center gap-2">
                  <ProgressRing progress={item.performance} size={40} strokeWidth={4} showText={false} />
                  <span className="text-emerald-400 font-semibold">{item.performance}%</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}