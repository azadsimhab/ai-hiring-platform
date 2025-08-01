import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { ProgressRing } from '../../ui/ProgressRing';

interface BackgroundVerificationStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  workflowData: any;
  isActive: boolean;
}

interface VerificationCheck {
  id: string;
  type: 'employment' | 'education' | 'criminal' | 'reference' | 'identity' | 'credit';
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'clear';
  priority: 'high' | 'medium' | 'low';
  description: string;
  startDate: string;
  completionDate?: string;
  result?: VerificationResult;
  documents?: Document[];
}

interface VerificationResult {
  status: 'clear' | 'issue' | 'pending';
  score: number;
  findings: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  complianceStatus: 'compliant' | 'non-compliant' | 'pending';
}

interface Document {
  id: string;
  name: string;
  type: 'id' | 'certificate' | 'reference' | 'employment' | 'other';
  status: 'pending' | 'verified' | 'rejected';
  uploadDate: string;
  verificationDate?: string;
  aiAnalysis?: {
    authenticity: number;
    completeness: number;
    validity: number;
  };
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  verificationChecks: VerificationCheck[];
  overallStatus: 'pending' | 'in-progress' | 'completed' | 'failed';
  riskScore: number;
  complianceScore: number;
}

const verificationTypes = [
  {
    type: 'employment',
    icon: '💼',
    description: 'Employment History Verification',
    priority: 'high' as const,
    estimatedTime: '2-3 business days'
  },
  {
    type: 'education',
    icon: '🎓',
    description: 'Educational Background Check',
    priority: 'high' as const,
    estimatedTime: '1-2 business days'
  },
  {
    type: 'criminal',
    icon: '🔍',
    description: 'Criminal Background Check',
    priority: 'high' as const,
    estimatedTime: '3-5 business days'
  },
  {
    type: 'reference',
    icon: '📞',
    description: 'Reference Verification',
    priority: 'medium' as const,
    estimatedTime: '2-4 business days'
  },
  {
    type: 'identity',
    icon: '🆔',
    description: 'Identity Verification',
    priority: 'high' as const,
    estimatedTime: '1 business day'
  },
  {
    type: 'credit',
    icon: '💳',
    description: 'Credit History Check',
    priority: 'low' as const,
    estimatedTime: '1-2 business days'
  }
];

export function BackgroundVerificationStep({ onComplete, onBack, workflowData, isActive }: BackgroundVerificationStepProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'compliance'>('overview');

  // Load candidates from previous step
  useEffect(() => {
    if (workflowData.step5?.interviews) {
      const candidatesData = workflowData.step5.interviews.map((interview: any) => {
        const checks = verificationTypes.map(type => ({
          id: `${interview.candidateId}-${type.type}`,
          type: type.type as any,
          status: 'pending' as const,
          priority: type.priority,
          description: type.description,
          startDate: new Date().toISOString(),
          documents: []
        }));

        return {
          id: interview.candidateId,
          name: interview.candidateName,
          email: `candidate${interview.candidateId}@example.com`,
          phone: '+1-555-0123',
          position: 'Software Engineer',
          verificationChecks: checks,
          overallStatus: 'pending' as const,
          riskScore: 0,
          complianceScore: 0
        };
      });
      setCandidates(candidatesData);
    }
  }, [workflowData]);

  const startVerification = async (candidateId: string) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) return;

    // Simulate verification process
    const totalSteps = candidate.verificationChecks.length * 3; // 3 steps per check
    let currentStep = 0;

    for (const check of candidate.verificationChecks) {
      // Step 1: Initiate check
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentStep++;
      setProcessingProgress((currentStep / totalSteps) * 100);

      // Step 2: Process check
      await new Promise(resolve => setTimeout(resolve, 1500));
      currentStep++;
      setProcessingProgress((currentStep / totalSteps) * 100);

      // Step 3: Complete check
      await new Promise(resolve => setTimeout(resolve, 1000));
      currentStep++;
      setProcessingProgress((currentStep / totalSteps) * 100);

      // Mock verification result
      const result: VerificationResult = {
        status: Math.random() > 0.1 ? 'clear' : 'issue',
        score: Math.floor(Math.random() * 30) + 70,
        findings: Math.random() > 0.1 ? ['All checks passed successfully'] : ['Minor discrepancy found in employment dates'],
        recommendations: Math.random() > 0.1 ? ['Proceed with hiring'] : ['Review employment history'],
        riskLevel: Math.random() > 0.8 ? 'medium' : 'low',
        complianceStatus: Math.random() > 0.1 ? 'compliant' : 'pending'
      };

      check.status = 'completed';
      check.completionDate = new Date().toISOString();
      check.result = result;
    }

    // Update candidate status
    const completedChecks = candidate.verificationChecks.filter(c => c.status === 'completed');
    const clearChecks = completedChecks.filter(c => c.result?.status === 'clear');
    
    const riskScore = completedChecks.reduce((acc, check) => acc + (check.result?.score || 0), 0) / completedChecks.length;
    const complianceScore = (clearChecks.length / completedChecks.length) * 100;

    setCandidates(prev => prev.map(c => 
      c.id === candidateId 
        ? {
            ...c,
            overallStatus: completedChecks.length === c.verificationChecks.length ? 'completed' : 'in-progress',
            riskScore,
            complianceScore
          }
        : c
    ));

    setIsProcessing(false);
    setProcessingProgress(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'failed': return '#ef4444';
      case 'clear': return '#10b981';
      case 'issue': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handleComplete = () => {
    const stepData = {
      candidates: candidates.filter(c => c.overallStatus === 'completed'),
      analytics: {
        totalCandidates: candidates.length,
        completedVerifications: candidates.filter(c => c.overallStatus === 'completed').length,
        averageRiskScore: candidates.reduce((acc, c) => acc + c.riskScore, 0) / candidates.length || 0,
        averageComplianceScore: candidates.reduce((acc, c) => acc + c.complianceScore, 0) / candidates.length || 0
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
            <div className="text-6xl">🔍</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">
                Step 6: Background Verification
              </h2>
              <p className="text-white/70 mt-2">
                Comprehensive background checks with AI-powered document verification
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">
                <AnimatedCounter value={candidates.length} />
              </div>
              <div className="text-white/60 text-sm">Total Candidates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                <AnimatedCounter value={candidates.filter(c => c.overallStatus === 'completed').length} />
              </div>
              <div className="text-white/60 text-sm">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                <AnimatedCounter value={candidates.filter(c => c.overallStatus === 'in-progress').length} />
              </div>
              <div className="text-white/60 text-sm">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-electric-400">
                <AnimatedCounter value={Math.round(candidates.reduce((acc, c) => acc + c.complianceScore, 0) / candidates.length || 0)} />
              </div>
              <div className="text-white/60 text-sm">Avg Compliance %</div>
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
                  Processing Background Checks
                </h3>
                <p className="text-white/70 mb-4">
                  Verifying employment, education, and criminal records...
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
                Candidates
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
                        : candidate.overallStatus === 'completed'
                        ? 'bg-emerald-500/10 border-emerald-400/50'
                        : candidate.overallStatus === 'in-progress'
                        ? 'bg-amber-500/10 border-amber-400/50'
                        : 'bg-white/5 border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{candidate.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        candidate.overallStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        candidate.overallStatus === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {candidate.overallStatus.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-white/60 mb-2">{candidate.position}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/50">
                        {candidate.verificationChecks.filter(c => c.status === 'completed').length}/{candidate.verificationChecks.length} checks
                      </div>
                      
                      {candidate.overallStatus === 'completed' && (
                        <div className="text-xs font-semibold" style={{ color: getRiskColor(candidate.riskScore) }}>
                          {Math.round(candidate.riskScore)}% Risk Score
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Verification Details */}
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
                        <div className="text-lg font-bold" style={{ color: getRiskColor(selectedCandidate.riskScore) }}>
                          {Math.round(selectedCandidate.riskScore)}%
                        </div>
                        <div className="text-xs text-white/60">Risk Score</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-400">
                          {Math.round(selectedCandidate.complianceScore)}%
                        </div>
                        <div className="text-xs text-white/60">Compliance</div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Checks */}
                  <div className="space-y-4">
                    {selectedCandidate.verificationChecks.map((check, index) => (
                      <motion.div
                        key={check.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-lg border border-white/10 bg-white/5"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {verificationTypes.find(t => t.type === check.type)?.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold">{check.description}</h4>
                              <p className="text-sm text-white/60">
                                {verificationTypes.find(t => t.type === check.type)?.estimatedTime}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{
                                backgroundColor: `${getPriorityColor(check.priority)}20`,
                                color: getPriorityColor(check.priority)
                              }}
                            >
                              {check.priority.toUpperCase()}
                            </span>
                            
                            <span
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{
                                backgroundColor: `${getStatusColor(check.status)}20`,
                                color: getStatusColor(check.status)
                              }}
                            >
                              {check.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {check.result && (
                          <div className="mt-3 p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold">Result:</span>
                              <span
                                className="px-2 py-1 rounded text-xs font-semibold"
                                style={{
                                  backgroundColor: `${getStatusColor(check.result.status)}20`,
                                  color: getStatusColor(check.result.status)
                                }}
                              >
                                {check.result.status.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-white/60">Score:</span>
                                <span className="ml-2 font-semibold" style={{ color: getRiskColor(check.result.score) }}>
                                  {check.result.score}%
                                </span>
                              </div>
                              <div>
                                <span className="text-white/60">Risk Level:</span>
                                <span className="ml-2 font-semibold" style={{ color: getPriorityColor(check.result.riskLevel) }}>
                                  {check.result.riskLevel.toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {check.result.findings.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-sm font-semibold mb-1">Findings:</h5>
                                <ul className="text-xs text-white/70 space-y-1">
                                  {check.result.findings.map((finding, idx) => (
                                    <li key={idx}>• {finding}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {check.status === 'pending' && (
                          <HolographicButton
                            variant="primary"
                            size="sm"
                            onClick={() => startVerification(selectedCandidate.id)}
                            disabled={isProcessing}
                            className="mt-3"
                          >
                            Start Verification
                          </HolographicButton>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {selectedCandidate.overallStatus === 'completed' && (
                    <div className="mt-6 text-center">
                      <HolographicButton
                        variant="primary"
                        onClick={handleComplete}
                        className="px-8"
                      >
                        Proceed to Final Decision →
                      </HolographicButton>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-white/60">
                  Select a candidate to view verification details
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 