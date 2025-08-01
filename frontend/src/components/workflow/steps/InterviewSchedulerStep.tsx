import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';
import { AnimatedCounter } from '../../ui/AnimatedCounter';

interface InterviewSchedulerStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  workflowData: any;
  isActive: boolean;
}

interface InterviewSlot {
  id: string;
  date: string;
  time: string;
  duration: number;
  interviewer: string;
  interviewerRole: string;
  type: 'phone' | 'video' | 'onsite';
  candidateId?: string;
  candidateName?: string;
  status: 'available' | 'scheduled' | 'completed';
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  matchScore: number;
  availability: string;
  preferredTimeSlots: string[];
  scheduledInterviews: InterviewSlot[];
}

const mockInterviewers = [
  { name: 'John Smith', role: 'Senior Engineering Manager', expertise: 'Technical Leadership' },
  { name: 'Sarah Johnson', role: 'Principal Engineer', expertise: 'System Design' },
  { name: 'Michael Chen', role: 'Product Manager', expertise: 'Product Strategy' },
  { name: 'Emily Davis', role: 'Director of Engineering', expertise: 'Architecture' },
  { name: 'David Wilson', role: 'Senior Developer', expertise: 'Full Stack Development' }
];

const generateTimeSlots = () => {
  const slots: InterviewSlot[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start from tomorrow

  for (let day = 0; day < 14; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    
    // Skip weekends
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;
    
    // Generate slots for each day (9 AM to 5 PM)
    for (let hour = 9; hour < 17; hour++) {
      const interviewer = mockInterviewers[Math.floor(Math.random() * mockInterviewers.length)];
      
      slots.push({
        id: `slot-${day}-${hour}`,
        date: currentDate.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:00`,
        duration: 60,
        interviewer: interviewer.name,
        interviewerRole: interviewer.role,
        type: Math.random() > 0.3 ? 'video' : 'onsite',
        status: 'available'
      });
    }
  }
  
  return slots.slice(0, 50); // Limit to 50 slots
};

export function InterviewSchedulerStep({ onComplete, onBack, workflowData, isActive }: InterviewSchedulerStepProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [availableSlots, setAvailableSlots] = useState<InterviewSlot[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<InterviewSlot | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [filterDate, setFilterDate] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Load candidates from previous step
  useEffect(() => {
    if (workflowData.step3?.candidates) {
      const candidatesData = workflowData.step3.candidates.map((candidate: any) => ({
        ...candidate,
        availability: candidate.availability || 'Flexible',
        preferredTimeSlots: ['09:00-12:00', '14:00-17:00'],
        scheduledInterviews: []
      }));
      setCandidates(candidatesData);
    }
    
    setAvailableSlots(generateTimeSlots());
  }, [workflowData]);

  const scheduleInterview = async (candidateId: string, slotId: string) => {
    setIsScheduling(true);
    
    // Simulate scheduling delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const candidate = candidates.find(c => c.id === candidateId);
    const slot = availableSlots.find(s => s.id === slotId);
    
    if (candidate && slot) {
      // Update slot
      setAvailableSlots(prev => prev.map(s => 
        s.id === slotId 
          ? { ...s, status: 'scheduled', candidateId, candidateName: candidate.name }
          : s
      ));
      
      // Update candidate
      setCandidates(prev => prev.map(c => 
        c.id === candidateId 
          ? { ...c, scheduledInterviews: [...c.scheduledInterviews, { ...slot, status: 'scheduled' }] }
          : c
      ));
    }
    
    setIsScheduling(false);
    setSelectedSlot(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return '📞';
      case 'video': return '📹';
      case 'onsite': return '🏢';
      default: return '📅';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#3b82f6';
      case 'scheduled': return '#10b981';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const groupSlotsByDate = (slots: InterviewSlot[]) => {
    const grouped: { [key: string]: InterviewSlot[] } = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const filteredSlots = filterDate 
    ? availableSlots.filter(slot => slot.date === filterDate)
    : availableSlots;

  const scheduledInterviews = availableSlots.filter(slot => slot.status === 'scheduled');
  const totalCandidates = candidates.length;
  const candidatesWithInterviews = candidates.filter(c => c.scheduledInterviews.length > 0).length;

  const handleComplete = () => {
    const stepData = {
      scheduledInterviews,
      candidates: candidates.filter(c => c.scheduledInterviews.length > 0),
      analytics: {
        totalCandidates,
        candidatesWithInterviews,
        totalInterviewsScheduled: scheduledInterviews.length,
        interviewTypes: {
          video: scheduledInterviews.filter(i => i.type === 'video').length,
          onsite: scheduledInterviews.filter(i => i.type === 'onsite').length,
          phone: scheduledInterviews.filter(i => i.type === 'phone').length
        }
      },
      timestamp: new Date().toISOString()
    };
    onComplete(stepData);
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard glow={true}>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">📅</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">
                Step 4: Interview Scheduler
              </h2>
              <p className="text-white/70 mt-2">
                Smart scheduling with calendar integration and availability matching
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">
                <AnimatedCounter value={totalCandidates} />
              </div>
              <div className="text-white/60 text-sm">Total Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                <AnimatedCounter value={scheduledInterviews.length} />
              </div>
              <div className="text-white/60 text-sm">Scheduled Interviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                <AnimatedCounter value={availableSlots.filter(s => s.status === 'available').length} />
              </div>
              <div className="text-white/60 text-sm">Available Slots</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-electric-400">
                <AnimatedCounter value={candidatesWithInterviews} />
              </div>
              <div className="text-white/60 text-sm">Ready for Interview</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Candidates List */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4 text-primary-400">
                Candidates
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border backdrop-blur-sm cursor-pointer transition-all ${
                      selectedCandidate?.id === candidate.id
                        ? 'bg-primary-500/20 border-primary-400'
                        : candidate.scheduledInterviews.length > 0
                        ? 'bg-emerald-500/10 border-emerald-400/50'
                        : 'bg-white/5 border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{candidate.name}</h4>
                        <p className="text-xs text-white/60">
                          Match: {candidate.matchScore}%
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        {candidate.scheduledInterviews.length > 0 ? (
                          <div className="text-xs text-emerald-400">
                            ✅ {candidate.scheduledInterviews.length} scheduled
                          </div>
                        ) : (
                          <div className="text-xs text-amber-400">
                            ⏳ Pending
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Schedule Interface */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary-400">
                  Available Interview Slots
                </h3>
                
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:border-primary-400 focus:outline-none"
                  />
                  
                  <div className="flex rounded-lg overflow-hidden border border-white/20">
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`px-4 py-2 text-sm transition-colors ${
                        viewMode === 'calendar'
                          ? 'bg-primary-500/20 text-primary-300'
                          : 'bg-black/30 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      Calendar
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-2 text-sm transition-colors ${
                        viewMode === 'list'
                          ? 'bg-primary-500/20 text-primary-300'
                          : 'bg-black/30 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>
              
              {viewMode === 'calendar' ? (
                /* Calendar View */
                <div className="grid grid-cols-1 gap-6 max-h-96 overflow-y-auto">
                  {Object.entries(groupSlotsByDate(filteredSlots)).map(([date, slots]) => (
                    <div key={date} className="border-b border-white/10 pb-4">
                      <h4 className="font-semibold mb-3 text-white/90">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <motion.div
                            key={slot.id}
                            whileHover={{ scale: 1.02 }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              slot.status === 'scheduled'
                                ? 'bg-emerald-500/20 border-emerald-400'
                                : selectedSlot?.id === slot.id
                                ? 'bg-primary-500/20 border-primary-400'
                                : 'bg-white/5 border-white/20 hover:border-white/40'
                            }`}
                            onClick={() => slot.status === 'available' && setSelectedSlot(slot)}
                          >
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                {getTypeIcon(slot.type)} {slot.time}
                              </div>
                              <div className="text-xs text-white/60 mt-1">
                                {slot.interviewer}
                              </div>
                              <div className="text-xs text-white/50">
                                {slot.interviewerRole}
                              </div>
                              {slot.status === 'scheduled' && (
                                <div className="text-xs text-emerald-400 mt-1">
                                  {slot.candidateName}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredSlots.map((slot, index) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        slot.status === 'scheduled'
                          ? 'bg-emerald-500/20 border-emerald-400'
                          : selectedSlot?.id === slot.id
                          ? 'bg-primary-500/20 border-primary-400'
                          : 'bg-white/5 border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => slot.status === 'available' && setSelectedSlot(slot)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {getTypeIcon(slot.type)} {new Date(slot.date).toLocaleDateString()} - {slot.time}
                          </div>
                          <div className="text-sm text-white/70">
                            {slot.interviewer} • {slot.interviewerRole}
                          </div>
                          {slot.status === 'scheduled' && (
                            <div className="text-sm text-emerald-400">
                              Scheduled with {slot.candidateName}
                            </div>
                          )}
                        </div>
                        
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getStatusColor(slot.status) }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <AnimatePresence>
        {selectedSlot && selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedSlot(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-900 border border-primary-400 rounded-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4 text-primary-400">
                Schedule Interview
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-white/70">Candidate:</span>
                  <div className="font-medium">{selectedCandidate.name}</div>
                </div>
                
                <div>
                  <span className="text-white/70">Date & Time:</span>
                  <div className="font-medium">
                    {new Date(selectedSlot.date).toLocaleDateString()} at {selectedSlot.time}
                  </div>
                </div>
                
                <div>
                  <span className="text-white/70">Interviewer:</span>
                  <div className="font-medium">
                    {selectedSlot.interviewer} - {selectedSlot.interviewerRole}
                  </div>
                </div>
                
                <div>
                  <span className="text-white/70">Type:</span>
                  <div className="font-medium">
                    {getTypeIcon(selectedSlot.type)} {selectedSlot.type.charAt(0).toUpperCase() + selectedSlot.type.slice(1)}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <HolographicButton
                  variant="secondary"
                  onClick={() => setSelectedSlot(null)}
                  disabled={isScheduling}
                  className="flex-1"
                >
                  Cancel
                </HolographicButton>
                <HolographicButton
                  variant="primary"
                  onClick={() => scheduleInterview(selectedCandidate.id, selectedSlot.id)}
                  disabled={isScheduling}
                  className="flex-1"
                >
                  {isScheduling ? 'Scheduling...' : 'Confirm'}
                </HolographicButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Button */}
      {scheduledInterviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <GlassCard>
            <div className="text-center">
              <p className="text-white/70 mb-4">
                {scheduledInterviews.length} interviews scheduled for {candidatesWithInterviews} candidates
              </p>
              <HolographicButton
                variant="primary"
                size="lg"
                onClick={handleComplete}
                className="px-12 py-4"
              >
                Proceed to Interview Assessment →
              </HolographicButton>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}