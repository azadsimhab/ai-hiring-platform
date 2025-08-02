import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';

export function ShortlistAgent({ user, isActive, onStatusChange }: any) {
  const candidates = [
    { id: 1, name: 'John Doe', score: 92, status: 'selected' },
    { id: 2, name: 'Jane Smith', score: 87, status: 'pending' },
    { id: 3, name: 'Mike Johnson', score: 85, status: 'rejected' }
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">✅</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">Final Shortlist Agent</h2>
              <p className="text-white/70 mt-2">Final candidate selection and automated communications</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <GlassCard>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary-400">Final Candidates</h3>
            <HolographicButton variant="success" size="sm">
              📧 Send Offers
            </HolographicButton>
          </div>
          
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-white">{candidate.name}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">{candidate.score}%</span>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      candidate.status === 'selected' ? 'bg-emerald-500/20 text-emerald-400' :
                      candidate.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {candidate.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <HolographicButton variant="success" size="sm">
                    ✅ Select
                  </HolographicButton>
                  <HolographicButton variant="error" size="sm">
                    ❌ Reject
                  </HolographicButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}