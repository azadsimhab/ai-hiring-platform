import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';

export function SettingsAgent({ user, isActive, onStatusChange }: any) {
  const [settings, setSettings] = useState({
    notifications: true,
    autoApproval: false,
    aiMode: 'advanced',
    timezone: 'UTC-5'
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">⚙️</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">Settings & Profile Agent</h2>
              <p className="text-white/70 mt-2">System configuration and user management</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-primary-400 mb-4">User Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Name</label>
              <input
                type="text"
                value={user?.name || ''}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Company</label>
              <input
                type="text"
                value={user?.company || ''}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-primary-400 mb-4">System Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/80">Email Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/80">Auto Approval</span>
              <input
                type="checkbox"
                checked={settings.autoApproval}
                onChange={(e) => setSettings({...settings, autoApproval: e.target.checked})}
                className="w-5 h-5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">AI Mode</label>
              <select
                value={settings.aiMode}
                onChange={(e) => setSettings({...settings, aiMode: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
              >
                <option value="basic">Basic</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
              >
                <option value="UTC-8">Pacific Time (UTC-8)</option>
                <option value="UTC-5">Eastern Time (UTC-5)</option>
                <option value="UTC+0">UTC (UTC+0)</option>
                <option value="UTC+1">Central European (UTC+1)</option>
              </select>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="flex justify-end">
        <HolographicButton variant="primary">
          💾 Save Settings
        </HolographicButton>
      </div>
    </div>
  );
}