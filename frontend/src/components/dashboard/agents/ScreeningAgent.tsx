import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';

export function ScreeningAgent({ user, isActive, onStatusChange }: any) {
  const [isRecording, setIsRecording] = useState(false);
  const [candidates] = useState([
    { id: 1, name: 'John Doe', status: 'pending', score: null },
    { id: 2, name: 'Jane Smith', status: 'completed', score: 87 },
    { id: 3, name: 'Mike Johnson', status: 'in-progress', score: null }
  ]);

  const startScreening = () => {
    setIsRecording(true);
    onStatusChange('processing');
    setTimeout(() => {
      setIsRecording(false);
      onStatusChange('active');
    }, 5000);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">🎥</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">AI Screening Agent</h2>
              <p className="text-white/70 mt-2">Human-like multimodal AI interviewer with real-time analysis</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-primary-400 mb-4">Live Interview</h3>
          <div className="bg-black/50 rounded-lg p-6 text-center mb-4">
            <div className="text-6xl mb-4">🎤</div>
            <p className="text-white/70 mb-4">
              {isRecording ? 'AI Interview in Progress...' : 'Ready to start AI screening'}
            </p>
            <HolographicButton
              variant={isRecording ? 'error' : 'primary'}
              onClick={startScreening}
              disabled={isRecording}
            >
              {isRecording ? '🔴 Recording...' : '▶ Start AI Interview'}
            </HolographicButton>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-primary-400 mb-4">Candidate Queue</h3>
          <div className="space-y-3">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-white">{candidate.name}</h4>
                  <p className="text-white/60 text-sm">{candidate.status}</p>
                </div>
                {candidate.score && (
                  <span className="text-emerald-400 font-bold">{candidate.score}%</span>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}