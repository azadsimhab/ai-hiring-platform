import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { ProgressRing } from '../../ui/ProgressRing';

interface FinalDecisionStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  workflowData: any;
  isActive: boolean;
}

interface CandidateEvaluation {
  id: string;
  name: string;
  email: string;
  position: string;
  overallScore: number;
  aiRecommendation: 'hire' | 'consider' | 'reject' | 'strong-hire';
  confidence: number;
  strengths: string[];
  concerns: string[];
  finalDecision?: 'hired' | 'rejected' | 'pending';
  decisionReason?: string;
  decisionDate?: string;
  compensation?: {
    baseSalary: number;
    equity: number;
    benefits: string[];
  };
  startDate?: string;
  onboardingPlan?: string[];
}

interface HiringMetrics {
  totalCandidates: number;
  hired: number;
  rejected: number;
  pending: number;
  averageScore: number;
  timeToHire: number;
  costPerHire: number;
  diversityMetrics: {
    gender: { male: number; female: number; other: number };
    ethnicity: { [key: string]: number };
    ageGroups: { [key: string]: number };
  };
}

const evaluationCriteria = [
  { name: 'Technical Skills', weight: 0.25 },
  { name: 'Communication', weight: 0.20 },
  { name: 'Problem Solving', weight: 0.20 },
  { name: 'Cultural Fit', weight: 0.15 },
  { name: 'Experience', weight: 0.10 },
  { name: 'Background Check', weight: 0.10 }
];

export function FinalDecisionStep({ onComplete, onBack, workflowData, isActive }: FinalDecisionStepProps) {
  const [candidates, setCandidates] = useState<CandidateEvaluation[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateEvaluation | null>(null);
  const [metrics, setMetrics] = useState<HiringMetrics>({
    totalCandidates: 0,
    hired: 0,
    rejected: 0,
    pending: 0,
    averageScore: 0,
    timeToHire: 0,
    costPerHire: 0,
    diversityMetrics: {
      gender: { male: 0, female: 0, other: 0 },
      ethnicity: {},
      ageGroups: {}
    }
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analytics'>('overview');

  // Load candidates from previous steps
  useEffect(() => {
    if (workflowData.step6?.candidates) {
      const candidatesData = workflowData.step6.candidates.map((candidate: any) => {
        // Calculate overall score from all previous steps
        const resumeScore = workflowData.step2?.candidates?.find((c: any) => c.id === candidate.id)?.matchScore || 0;
        const interviewScore = workflowData.step5?.interviews?.find((i: any) => i.candidateId === candidate.id)?.aiAnalysis?.overallScore || 0;
        const backgroundScore = candidate.complianceScore || 0;
        
        const overallScore = Math.round((resumeScore * 0.3 + interviewScore * 0.5 + backgroundScore * 0.2));
        
        // AI recommendation based on score
        let aiRecommendation: 'hire' | 'consider' | 'reject' | 'strong-hire';
        if (overallScore >= 90) aiRecommendation = 'strong-hire';
        else if (overallScore >= 80) aiRecommendation = 'hire';
        else if (overallScore >= 70) aiRecommendation = 'consider';
        else aiRecommendation = 'reject';

        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          position: candidate.position,
          overallScore,
          aiRecommendation,
          confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
          strengths: [
            'Strong technical background',
            'Excellent communication skills',
            'Good cultural fit',
            'Relevant experience'
          ],
          concerns: overallScore < 80 ? [
            'Some gaps in experience',
            'Needs additional training'
          ] : [],
          finalDecision: undefined
        };
      });
      
      setCandidates(candidatesData);
      
      // Calculate metrics
      const totalCandidates = candidatesData.length;
      const averageScore = candidatesData.reduce((acc: number, c: any) => acc + c.overallScore, 0) / totalCandidates;
      
      setMetrics({
        totalCandidates,
        hired: 0,
        rejected: 0,
        pending: totalCandidates,
        averageScore,
        timeToHire: 14, // days
        costPerHire: 2500, // USD
        diversityMetrics: {
          gender: { male: Math.floor(totalCandidates * 0.6), female: Math.floor(totalCandidates * 0.35), other: Math.floor(totalCandidates * 0.05) },
          ethnicity: { 'Asian': 30, 'White': 40, 'Hispanic': 15, 'Black': 10, 'Other': 5 },
          ageGroups: { '25-30': 40, '31-35': 35, '36-40': 20, '41+': 5 }
        }
      });
    }
  }, [workflowData]);

  const makeDecision = async (candidateId: string, decision: 'hired' | 'rejected', reason?: string) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate decision processing
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingProgress(i);
    }
    
    setCandidates(prev => prev.map(c => 
      c.id === candidateId 
        ? {
            ...c,
            finalDecision: decision,
            decisionReason: reason || (decision === 'hired' ? 'Strong candidate with excellent qualifications' : 'Does not meet current requirements'),
            decisionDate: new Date().toISOString(),
            ...(decision === 'hired' ? {
              compensation: {
                baseSalary: 120000 + Math.floor(Math.random() * 30000),
                equity: 0.1 + Math.random() * 0.2,
                benefits: ['Health Insurance', '401k', 'Stock Options', 'Flexible PTO']
              },
              startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              onboardingPlan: [
                'Day 1: Company orientation and team introductions',
                'Week 1: Technical setup and project overview',
                'Month 1: Mentorship program and skill development',
                'Month 3: Performance review and goal setting'
              ]
            } : {})
          }
        : c
    ));
    
    // Update metrics
    const hired = candidates.filter(c => c.finalDecision === 'hired').length + (decision === 'hired' ? 1 : 0);
    const rejected = candidates.filter(c => c.finalDecision === 'rejected').length + (decision === 'rejected' ? 1 : 0);
    const pending = candidates.length - hired - rejected;
    
    setMetrics(prev => ({
      ...prev,
      hired,
      rejected,
      pending
    }));
    
    setIsProcessing(false);
    setProcessingProgress(0);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong-hire': return '#10b981';
      case 'hire': return '#3b82f6';
      case 'consider': return '#f59e0b';
      case 'reject': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const handleComplete = () => {
    const stepData = {
      candidates: candidates.filter(c => c.finalDecision),
      metrics,
      analytics: {
        totalProcessed: candidates.length,
        hireRate: (metrics.hired / metrics.totalCandidates) * 100,
        averageScore: metrics.averageScore,
        timeToHire: metrics.timeToHire,
        costPerHire: metrics.costPerHire
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
            <div className="text-6xl">🎯</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">
                Step 7: Final Decision Dashboard
              </h2>
              <p className="text-white/70 mt-2">
                AI-powered hiring decisions with comprehensive candidate evaluation
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">
                <AnimatedCounter value={metrics.totalCandidates} />
              </div>
              <div className="text-white/60 text-sm">Total Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                <AnimatedCounter value={metrics.hired} />
              </div>
              <div className="text-white/60 text-sm">Hired</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                <AnimatedCounter value={metrics.pending} />
              </div>
              <div className="text-white/60 text-sm">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-electric-400">
                <AnimatedCounter value={Math.round(metrics.averageScore)} />
              </div>
              <div className="text-white/60 text-sm">Avg Score</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Processing Modal */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <GlassCard className="max-w-md w-full mx-4">
              <div className="text-center">
                <ProgressRing
                  progress={processingProgress}
                  size={120}
                  strokeWidth={8}
                  className="mb-6"
                />
                <h3 className="text-xl font-semibold mb-2 text-primary-400">
                  Processing Decision
                </h3>
                <p className="text-white/70 mb-4">
                  Finalizing candidate evaluation and generating offer...
                </p>
                <div className="text-sm text-white/60">
                  {Math.round(processingProgress)}% Complete
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidates List */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4 text-primary-400">
                Candidate Evaluations
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border backdrop-blur-sm cursor-pointer transition-all ${
                      selectedCandidate?.id === candidate.id
                        ? 'bg-primary-500/20 border-primary-400'
                        : candidate.finalDecision === 'hired'
                        ? 'bg-emerald-500/10 border-emerald-400/50'
                        : candidate.finalDecision === 'rejected'
                        ? 'bg-red-500/10 border-red-400/50'
                        : 'bg-white/5 border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{candidate.name}</h4>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getRecommendationColor(candidate.aiRecommendation)}20`,
                          color: getRecommendationColor(candidate.aiRecommendation)
                        }}
                      >
                        {candidate.aiRecommendation.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-white/60 mb-2">{candidate.position}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold" style={{ color: getScoreColor(candidate.overallScore) }}>
                        {candidate.overallScore}%
                      </div>
                      
                      {candidate.finalDecision ? (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          candidate.finalDecision === 'hired' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {candidate.finalDecision.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-xs text-white/50">
                          {candidate.confidence}% confidence
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Candidate Details */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard>
              {selectedCandidate ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-primary-400">
                        {selectedCandidate.name}
                      </h3>
                      <p className="text-white/60">{selectedCandidate.position}</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="text-center">
                        <div className="text-lg font-bold" style={{ color: getScoreColor(selectedCandidate.overallScore) }}>
                          {selectedCandidate.overallScore}%
                        </div>
                        <div className="text-xs text-white/60">Overall Score</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary-400">
                          {selectedCandidate.confidence}%
                        </div>
                        <div className="text-xs text-white/60">AI Confidence</div>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-emerald-400 mb-3">Strengths</h4>
                      <div className="space-y-2">
                        {selectedCandidate.strengths.map((strength, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="text-emerald-400">✓</span>
                            <span className="text-white/80">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-amber-400 mb-3">Areas of Concern</h4>
                      <div className="space-y-2">
                        {selectedCandidate.concerns.length > 0 ? (
                          selectedCandidate.concerns.map((concern, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <span className="text-amber-400">⚠</span>
                              <span className="text-white/80">{concern}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-white/60">No significant concerns identified</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-primary-500/10 to-emerald-500/10 rounded-lg border border-primary-400/20">
                    <h4 className="font-semibold text-primary-400 mb-2">AI Recommendation</h4>
                    <div className="flex items-center justify-between">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                          backgroundColor: `${getRecommendationColor(selectedCandidate.aiRecommendation)}20`,
                          color: getRecommendationColor(selectedCandidate.aiRecommendation)
                        }}
                      >
                        {selectedCandidate.aiRecommendation.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-white/60">
                        {selectedCandidate.confidence}% confidence level
                      </span>
                    </div>
                  </div>

                  {/* Decision Section */}
                  {!selectedCandidate.finalDecision ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white/90">Make Final Decision</h4>
                      
                      <div className="flex gap-3">
                        <HolographicButton
                          variant="primary"
                          onClick={() => makeDecision(selectedCandidate.id, 'hired')}
                          disabled={isProcessing}
                          className="flex-1"
                        >
                          🎉 Hire Candidate
                        </HolographicButton>
                        
                        <HolographicButton
                          variant="error"
                          onClick={() => makeDecision(selectedCandidate.id, 'rejected')}
                          disabled={isProcessing}
                          className="flex-1"
                        >
                          ❌ Reject Candidate
                        </HolographicButton>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg border ${
                        selectedCandidate.finalDecision === 'hired' 
                          ? 'bg-emerald-500/10 border-emerald-400/50' 
                          : 'bg-red-500/10 border-red-400/50'
                      }`}>
                        <h4 className="font-semibold mb-2">
                          {selectedCandidate.finalDecision === 'hired' ? '🎉 Hired!' : '❌ Rejected'}
                        </h4>
                        <p className="text-sm text-white/70 mb-2">
                          {selectedCandidate.decisionReason}
                        </p>
                        <p className="text-xs text-white/50">
                          Decision made on {new Date(selectedCandidate.decisionDate!).toLocaleDateString()}
                        </p>
                      </div>

                      {selectedCandidate.finalDecision === 'hired' && selectedCandidate.compensation && (
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <h5 className="font-semibold text-emerald-400 mb-3">Offer Details</h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-white/60">Base Salary:</span>
                              <div className="font-semibold">${selectedCandidate.compensation.baseSalary.toLocaleString()}/year</div>
                            </div>
                            <div>
                              <span className="text-white/60">Equity:</span>
                              <div className="font-semibold">{(selectedCandidate.compensation.equity * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-white/60">Start Date:</span>
                              <div className="font-semibold">{selectedCandidate.startDate}</div>
                            </div>
                            <div>
                              <span className="text-white/60">Benefits:</span>
                              <div className="text-xs text-white/70">
                                {selectedCandidate.compensation.benefits.join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-white/60">
                  Select a candidate to view detailed evaluation
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {candidates.some(c => c.finalDecision) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard>
            <h3 className="text-xl font-semibold mb-6 text-primary-400">Hiring Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {Math.round((metrics.hired / metrics.totalCandidates) * 100)}%
                </div>
                <div className="text-white/60 text-sm">Hire Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {metrics.timeToHire} days
                </div>
                <div className="text-white/60 text-sm">Time to Hire</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-electric-400">
                  ${metrics.costPerHire.toLocaleString()}
                </div>
                <div className="text-white/60 text-sm">Cost per Hire</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {Math.round(metrics.averageScore)}%
                </div>
                <div className="text-white/60 text-sm">Avg Candidate Score</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Complete Button */}
      {candidates.every(c => c.finalDecision) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <GlassCard>
            <div className="text-center">
              <p className="text-white/70 mb-4">
                All candidates have been evaluated and decisions made
              </p>
              <HolographicButton
                variant="primary"
                size="lg"
                onClick={handleComplete}
                className="px-12 py-4"
              >
                Complete Hiring Process 🎉
              </HolographicButton>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
} 