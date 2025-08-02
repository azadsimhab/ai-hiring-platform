import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';

export function SchedulingAgent({ user, isActive, onStatusChange }: any) {
  const [meetings, setMeetings] = useState([
    { id: 1, candidate: 'John Doe', time: '2025-08-02 10:00', status: 'scheduled' },
    { id: 2, candidate: 'Jane Smith', time: '2025-08-02 14:00', status: 'confirmed' },
    { id: 3, candidate: 'Mike Johnson', time: '2025-08-03 11:00', status: 'pending' }
  ]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">📅</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">Scheduling Agent</h2>
              <p className="text-white/70 mt-2">Autonomous interview scheduling with calendar integration</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <GlassCard>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary-400">Scheduled Interviews</h3>
            <HolographicButton variant="primary" size="sm">
              ➕ Schedule New
            </HolographicButton>
          </div>
          
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="bg-white/5 p-4 rounded-lg border border-white/10 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-white">{meeting.candidate}</h4>
                  <p className="text-white/60 text-sm">{meeting.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  meeting.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                  meeting.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {meeting.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}