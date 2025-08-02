import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { ProgressRing } from '../ui/ProgressRing';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { HolographicButton } from '../ui/HolographicButton';

// Real-time metrics interface
interface MetricsData {
  candidatesProcessed: number;
  successfulHires: number;
  activeRequests: number;
  aiProcessingTime: number;
  biasScore: number;
  systemUptime: number;
}

// Live Activity Feed Item
interface ActivityItem {
  id: string;
  type: 'hire' | 'application' | 'interview' | 'analysis';
  title: string;
  subtitle: string;
  timestamp: Date;
  status: 'success' | 'processing' | 'pending';
}

// Success Prediction Component
function SuccessPredictionMeter({ percentage }: { percentage: number }) {
  const getColor = (percent: number) => {
    if (percent >= 80) return '#10b981'; // emerald
    if (percent >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="relative">
      <ProgressRing
        progress={percentage}
        size={140}
        color={getColor(percentage)}
        strokeWidth={12}
        showText={false}
        glowEffect={true}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedCounter 
          value={percentage} 
          suffix="%" 
          className="text-2xl font-bold text-white"
        />
        <span className="text-xs text-white/60">Success Rate</span>
      </div>
    </div>
  );
}

// Real-time Chart Component (simplified)
function RealtimeChart({ data, title, color }: { data: number[], title: string, color: string }) {
  const maxValue = Math.max(...data);
  
  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold">{title}</h3>
      <div className="h-32 flex items-end gap-1">
        {data.map((value, index) => (
          <motion.div
            key={index}
            className={`flex-1 rounded-t`}
            style={{ backgroundColor: color }}
            initial={{ height: 0 }}
            animate={{ height: `${(value / maxValue) * 100}%` }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}

// Activity Feed Component
function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  const getActivityIcon = (type: string) => {
    const icons = {
      hire: '🎉',
      application: '📝',
      interview: '🎥',
      analysis: '🔍'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      success: 'text-emerald-400',
      processing: 'text-electric-400',
      pending: 'text-amber-400'
    };
    return colors[status as keyof typeof colors] || 'text-white';
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      <AnimatePresence>
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="text-2xl animate-bounce-subtle">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${getStatusColor(activity.status)}`}>
                {activity.title}
              </h4>
              <p className="text-white/60 text-sm">{activity.subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs">
                {activity.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Performance Guarantee Tracker
function PerformanceGuarantee() {
  const [guarantee, setGuarantee] = useState({
    currentPerformance: 94.2,
    targetPerformance: 90,
    daysRemaining: 23,
    confidence: 98.5
  });

  const isOnTrack = guarantee.currentPerformance >= guarantee.targetPerformance;

  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Performance Guarantee</h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isOnTrack ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          {isOnTrack ? 'On Track' : 'At Risk'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <AnimatedCounter 
            value={guarantee.currentPerformance} 
            suffix="%" 
            decimals={1}
            className="text-2xl font-bold text-emerald-400" 
          />
          <p className="text-white/60 text-sm">Current</p>
        </div>
        <div className="text-center">
          <AnimatedCounter 
            value={guarantee.targetPerformance} 
            suffix="%" 
            className="text-2xl font-bold text-white" 
          />
          <p className="text-white/60 text-sm">Target</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/70">Days Remaining</span>
          <span className="text-electric-400 font-semibold">{guarantee.daysRemaining}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/70">Confidence</span>
          <span className="text-emerald-400 font-semibold">{guarantee.confidence}%</span>
        </div>
        
        <div className="pt-4">
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div 
              className="bg-gradient-success h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(guarantee.currentPerformance / guarantee.targetPerformance) * 100}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// Bias Detection Monitor
function BiasMonitor() {
  const [biasScore, setBiasScore] = useState(2.1);
  const [alerts, setAlerts] = useState([
    { type: 'gender', severity: 'low', resolved: true },
    { type: 'age', severity: 'medium', resolved: false },
    { type: 'education', severity: 'low', resolved: true }
  ]);

  const getBiasLevel = (score: number) => {
    if (score <= 3) return { level: 'Excellent', color: 'emerald' };
    if (score <= 6) return { level: 'Good', color: 'electric' };
    if (score <= 8) return { level: 'Fair', color: 'amber' };
    return { level: 'Needs Attention', color: 'red' };
  };

  const biasLevel = getBiasLevel(biasScore);
  const statusColor = biasLevel.color === 'emerald' ? 'bg-emerald-400' : 
                     biasLevel.color === 'electric' ? 'bg-electric-400' : 
                     biasLevel.color === 'amber' ? 'bg-amber-400' : 'bg-red-400';

  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Bias Monitor</h3>
        <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`} />
      </div>
      
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <ProgressRing
            progress={100 - (biasScore / 10) * 100}
            size={120}
            color={`var(--tw-color-${biasLevel.color}-400)`}
            strokeWidth={10}
            showText={false}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatedCounter 
              value={biasScore} 
              decimals={1}
              className="text-2xl font-bold text-white"
            />
            <span className="text-xs text-white/60">Bias Score</span>
          </div>
        </div>
        <p className={`mt-2 font-medium ${
          biasLevel.color === 'emerald' ? 'text-emerald-400' : 
          biasLevel.color === 'electric' ? 'text-electric-400' : 
          biasLevel.color === 'amber' ? 'text-amber-400' : 'text-red-400'
        }`}>
          {biasLevel.level}
        </p>
      </div>
      
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between p-2 rounded ${
              alert.resolved ? 'bg-emerald-500/10' : 'bg-amber-500/10'
            }`}
          >
            <span className="text-white/80 capitalize">{alert.type}</span>
            <span className={`text-xs px-2 py-1 rounded ${
              alert.resolved 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {alert.resolved ? 'Resolved' : 'Active'}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// Main Dashboard Component
export function MissionControlDashboard() {
  const [metrics, setMetrics] = useState<MetricsData>({
    candidatesProcessed: 15420,
    successfulHires: 847,
    activeRequests: 23,
    aiProcessingTime: 0.3,
    biasScore: 2.1,
    systemUptime: 99.7
  });

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'hire',
      title: 'Sarah Chen hired as Senior Developer',
      subtitle: 'TechCorp - 94% match score',
      timestamp: new Date(Date.now() - 300000),
      status: 'success'
    },
    {
      id: '2',
      type: 'analysis',
      title: 'Resume batch analysis completed',
      subtitle: '156 candidates processed',
      timestamp: new Date(Date.now() - 600000),
      status: 'success'
    },
    {
      id: '3',
      type: 'interview',
      title: 'AI interview screening in progress',
      subtitle: 'Frontend Developer role',
      timestamp: new Date(Date.now() - 900000),
      status: 'processing'
    },
    {
      id: '4',
      type: 'application',
      title: 'New applications received',
      subtitle: '23 candidates for Data Scientist role',
      timestamp: new Date(Date.now() - 1200000),
      status: 'pending'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        candidatesProcessed: prev.candidatesProcessed + Math.floor(Math.random() * 3),
        activeRequests: Math.max(0, prev.activeRequests + (Math.random() > 0.5 ? 1 : -1))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const chartData = [45, 52, 48, 61, 58, 67, 73, 69, 82, 79, 85, 91];

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-display font-bold text-hologram mb-2">
          Mission Control
        </h1>
        <p className="text-white/70 text-lg">
          Real-time insights and AI-powered hiring intelligence
        </p>
      </motion.div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard glow={true}>
            <div className="text-center">
              <AnimatedCounter 
                value={metrics.candidatesProcessed}
                className="text-3xl font-bold text-primary-400"
              />
              <p className="text-white/70 mt-2">Candidates Processed</p>
              <div className="mt-2 text-emerald-400 text-sm">
                +{Math.floor(Math.random() * 10)} today
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard glow={true}>
            <div className="text-center">
              <AnimatedCounter 
                value={metrics.successfulHires}
                className="text-3xl font-bold text-emerald-400"
              />
              <p className="text-white/70 mt-2">Successful Hires</p>
              <div className="mt-2 text-electric-400 text-sm">
                94% success rate
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GlassCard glow={true}>
            <div className="text-center">
              <AnimatedCounter 
                value={metrics.activeRequests}
                className="text-3xl font-bold text-electric-400"
              />
              <p className="text-white/70 mt-2">Active Requests</p>
              <div className="mt-2 text-amber-400 text-sm">
                {Math.floor(Math.random() * 5)} urgent
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GlassCard glow={true}>
            <div className="text-center">
              <AnimatedCounter 
                value={metrics.aiProcessingTime}
                suffix="s"
                decimals={1}
                className="text-3xl font-bold text-amber-400"
              />
              <p className="text-white/70 mt-2">Avg Processing</p>
              <div className="mt-2 text-emerald-400 text-sm">
                Lightning fast ⚡
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Success Prediction */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <GlassCard className="h-full text-center">
            <h3 className="text-white font-semibold mb-6">Success Prediction</h3>
            <SuccessPredictionMeter percentage={94} />
            <p className="text-white/60 mt-4 text-sm">
              Based on 15,420+ successful placements
            </p>
            <HolographicButton 
              variant="primary" 
              size="sm" 
              className="mt-4"
            >
              View Details
            </HolographicButton>
          </GlassCard>
        </motion.div>

        {/* Real-time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GlassCard className="h-full">
            <RealtimeChart 
              data={chartData}
              title="Hiring Pipeline Flow"
              color="#6366f1"
            />
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-white/60">Last 12 hours</span>
              <span className="text-emerald-400">+23% today</span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Bias Monitor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <BiasMonitor />
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Live Activity Feed</h3>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
            <ActivityFeed activities={activities} />
          </GlassCard>
        </motion.div>

        {/* Performance Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <PerformanceGuarantee />
        </motion.div>
      </div>
    </div>
  );
}