import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { ProgressRing } from '../../ui/ProgressRing';

interface CandidateMatchingStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  workflowData: any;
  isActive: boolean;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  matchScore: number;
  skills: string[];
  experience: number;
  education: string[];
  strengths: string[];
  concerns: string[];
  overallRating: 'excellent' | 'good' | 'fair' | 'poor';
  aiInsights: string[];
  cultureFit: number;
  technicalFit: number;
  experienceFit: number;
  salaryExpectation: string;
  availability: string;
  location: string;
  isSelected: boolean;
}

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex.chen@email.com',
    phone: '+1 (555) 123-4567',
    matchScore: 92,
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'GraphQL'],
    experience: 5,
    education: ['B.S. Computer Science - Stanford University', 'AWS Certified Solutions Architect'],
    strengths: ['Strong technical leadership', 'Excellent problem-solving', 'Team collaboration'],
    concerns: ['No Python experience', 'Limited data science background'],
    overallRating: 'excellent',
    aiInsights: [
      'Top performer with proven track record',
      'Strong system design capabilities',
      'Excellent culture fit based on values alignment'
    ],
    cultureFit: 88,
    technicalFit: 95,
    experienceFit: 92,
    salaryExpectation: '$95k - $115k',
    availability: 'Available in 2 weeks',
    location: 'San Francisco, CA',
    isSelected: false
  },
  {
    id: '2',
    name: 'Sarah Rodriguez',
    email: 's.rodriguez@email.com',
    phone: '+1 (555) 987-6543',
    matchScore: 87,
    skills: ['JavaScript', 'React', 'Python', 'Machine Learning', 'TensorFlow'],
    experience: 3,
    education: ['B.S. Computer Engineering - MIT', 'Machine Learning Specialization'],
    strengths: ['Strong ML background', 'Research experience', 'Fast learner'],
    concerns: ['Limited senior experience', 'No cloud certifications'],
    overallRating: 'good',
    aiInsights: [
      'High potential for growth',
      'Strong analytical skills',
      'Good fit for AI-focused roles'
    ],
    cultureFit: 85,
    technicalFit: 88,
    experienceFit: 75,
    salaryExpectation: '$75k - $95k',
    availability: 'Available immediately',
    location: 'Remote',
    isSelected: false
  },
  {
    id: '3',
    name: 'Michael Kumar',
    email: 'm.kumar@email.com',
    phone: '+1 (555) 456-7890',
    matchScore: 78,
    skills: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'Kubernetes'],
    experience: 4,
    education: ['B.S. Software Engineering - UC Berkeley', 'Scrum Master Certified'],
    strengths: ['Full-stack expertise', 'DevOps knowledge', 'Agile methodology'],
    concerns: ['Limited TypeScript experience', 'No AWS certifications'],
    overallRating: 'good',
    aiInsights: [
      'Well-rounded developer',
      'Strong database knowledge',
      'Good project management skills'
    ],
    cultureFit: 82,
    technicalFit: 85,
    experienceFit: 88,
    salaryExpectation: '$85k - $105k',
    availability: 'Available in 1 month',
    location: 'Austin, TX',
    isSelected: false
  }
];

const matchingCriteria = [
  { name: 'Technical Skills', weight: 35 },
  { name: 'Experience Level', weight: 25 },
  { name: 'Culture Fit', weight: 20 },
  { name: 'Education', weight: 10 },
  { name: 'Location/Remote', weight: 10 }
];

export function CandidateMatchingStep({ onComplete, onBack, workflowData, isActive }: CandidateMatchingStepProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sortBy, setSortBy] = useState<'matchScore' | 'experience' | 'name'>('matchScore');
  const [filterRating, setFilterRating] = useState<string>('all');

  // Load candidates from previous step or mock data
  useEffect(() => {
    if (workflowData.step2?.resumes) {
      // Convert resume data to candidate data
      const candidatesFromResumes = workflowData.step2.resumes.map((resume: any, index: number) => ({
        ...mockCandidates[index % mockCandidates.length],
        id: resume.id || `candidate-${index}`,
        name: resume.analysis?.candidateName || `Candidate ${index + 1}`,
        email: resume.analysis?.email || `candidate${index + 1}@email.com`,
        matchScore: resume.analysis?.matchScore || Math.floor(Math.random() * 40) + 60,
        skills: resume.analysis?.skills || [],
        experience: resume.analysis?.experience_years || Math.floor(Math.random() * 8) + 1
      }));
      setCandidates(candidatesFromResumes);
    } else {
      setCandidates(mockCandidates);
    }
  }, [workflowData]);

  const runAIMatching = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Update candidates with refined scores
    setCandidates(prev => prev.map(candidate => ({
      ...candidate,
      matchScore: Math.min(candidate.matchScore + Math.floor(Math.random() * 10), 98),
      aiInsights: [
        ...candidate.aiInsights,
        'AI-enhanced matching completed',
        'Bias-free evaluation applied'
      ]
    })));
    
    setIsAnalyzing(false);
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId 
        ? { ...candidate, isSelected: !candidate.isSelected }
        : candidate
    ));
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const sortedAndFilteredCandidates = candidates
    .filter(candidate => filterRating === 'all' || candidate.overallRating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'matchScore': return b.matchScore - a.matchScore;
        case 'experience': return b.experience - a.experience;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const selectedCandidates = candidates.filter(c => c.isSelected);
  const avgMatchScore = candidates.length > 0 
    ? Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length)
    : 0;

  const handleComplete = () => {
    const stepData = {
      candidates: selectedCandidates,
      analytics: {
        totalCandidates: candidates.length,
        selectedCandidates: selectedCandidates.length,
        averageMatchScore: avgMatchScore,
        topMatchScore: Math.max(...candidates.map(c => c.matchScore))
      },
      matchingCriteria,
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
                Step 3: Candidate Matching
              </h2>
              <p className="text-white/70 mt-2">
                AI-powered candidate scoring with bias-free evaluation
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
                <AnimatedCounter value={selectedCandidates.length} />
              </div>
              <div className="text-white/60 text-sm">Selected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                <AnimatedCounter value={avgMatchScore} suffix="%" />
              </div>
              <div className="text-white/60 text-sm">Avg Match Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-electric-400">
                <AnimatedCounter value={97} suffix="%" />
              </div>
              <div className="text-white/60 text-sm">Bias-Free Score</div>
            </div>
          </div>

          {/* AI Matching Button */}
          <div className="mt-6 text-center">
            <HolographicButton
              variant="primary"
              onClick={runAIMatching}
              disabled={isAnalyzing}
              className="px-8 py-3"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Running AI Analysis...
                </div>
              ) : (
                '🤖 Enhance Matching with AI'
              )}
            </HolographicButton>
          </div>
        </GlassCard>
      </motion.div>

      {/* Matching Criteria */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard>
          <h3 className="text-xl font-semibold mb-4 text-primary-400">
            Matching Criteria Weights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {matchingCriteria.map((criteria, index) => (
              <div key={index} className="text-center">
                <div className="mb-2">
                  <ProgressRing 
                    progress={criteria.weight * 2.5} 
                    size={60} 
                    strokeWidth={4}
                    className="text-primary-400 mx-auto"
                  />
                </div>
                <div className="text-sm font-medium">{criteria.name}</div>
                <div className="text-xs text-white/60">{criteria.weight}% weight</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidate List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-primary-400">
                  Candidate Rankings
                </h3>
                
                <div className="flex gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:border-primary-400 focus:outline-none"
                  >
                    <option value="matchScore">Sort by Match Score</option>
                    <option value="experience">Sort by Experience</option>
                    <option value="name">Sort by Name</option>
                  </select>
                  
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:border-primary-400 focus:outline-none"
                  >
                    <option value="all">All Ratings</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {sortedAndFilteredCandidates.map((candidate, index) => (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border backdrop-blur-sm cursor-pointer transition-all ${
                        candidate.isSelected
                          ? 'bg-emerald-500/20 border-emerald-400'
                          : selectedCandidate?.id === candidate.id
                          ? 'bg-primary-500/20 border-primary-400'
                          : 'bg-white/5 border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={candidate.isSelected}
                            onChange={() => toggleCandidateSelection(candidate.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-white/20 bg-black/50 checked:bg-emerald-500 checked:border-emerald-400"
                          />
                          
                          <div>
                            <h4 className="font-semibold">{candidate.name}</h4>
                            <p className="text-sm text-white/60">
                              {candidate.experience} years • {candidate.location}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-emerald-400">
                              {candidate.matchScore}%
                            </div>
                            <div className="text-xs text-white/60">Match</div>
                          </div>
                          
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getRatingColor(candidate.overallRating) }}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {candidate.skills.slice(0, 4).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-1 bg-primary-500/20 text-primary-300 border border-primary-400/30 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 4 && (
                          <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                            +{candidate.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Candidate Details */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="h-full">
              <h3 className="text-xl font-semibold mb-4 text-primary-400">
                Candidate Details
              </h3>
              
              {selectedCandidate ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{selectedCandidate.name}</h4>
                    <div className="space-y-1 text-sm text-white/70">
                      <p>📧 {selectedCandidate.email}</p>
                      <p>📱 {selectedCandidate.phone}</p>
                      <p>📍 {selectedCandidate.location}</p>
                      <p>💰 {selectedCandidate.salaryExpectation}</p>
                      <p>📅 {selectedCandidate.availability}</p>
                    </div>
                  </div>

                  {/* Fit Scores */}
                  <div>
                    <h4 className="font-semibold mb-3">Fit Analysis</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Technical Fit</span>
                          <span className="text-sm font-semibold text-primary-400">
                            {selectedCandidate.technicalFit}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedCandidate.technicalFit}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Culture Fit</span>
                          <span className="text-sm font-semibold text-emerald-400">
                            {selectedCandidate.cultureFit}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedCandidate.cultureFit}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">Experience Fit</span>
                          <span className="text-sm font-semibold text-amber-400">
                            {selectedCandidate.experienceFit}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedCandidate.experienceFit}%` }}
                            transition={{ duration: 1, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div>
                    <h4 className="font-semibold mb-2 text-primary-400">AI Insights</h4>
                    <ul className="space-y-1">
                      {selectedCandidate.aiInsights.map((insight, index) => (
                        <li key={index} className="text-sm text-white/80 flex items-start gap-2">
                          <span className="text-primary-400 mt-1">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h4 className="font-semibold mb-2 text-emerald-400">Strengths</h4>
                    <ul className="space-y-1">
                      {selectedCandidate.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-white/80 flex items-start gap-2">
                          <span className="text-emerald-400 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Concerns */}
                  {selectedCandidate.concerns.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-amber-400">Areas to Explore</h4>
                      <ul className="space-y-1">
                        {selectedCandidate.concerns.map((concern, index) => (
                          <li key={index} className="text-sm text-white/80 flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span>
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-white/50">
                  Select a candidate to view details
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Complete Button */}
      {selectedCandidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <GlassCard>
            <div className="text-center">
              <p className="text-white/70 mb-4">
                {selectedCandidates.length} candidates selected for interview process
              </p>
              <HolographicButton
                variant="primary"
                size="lg"
                onClick={handleComplete}
                className="px-12 py-4"
              >
                Schedule Interviews →
              </HolographicButton>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}