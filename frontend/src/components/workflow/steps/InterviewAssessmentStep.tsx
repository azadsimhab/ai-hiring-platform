import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { ProgressRing } from '../../ui/ProgressRing';

interface InterviewAssessmentStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  workflowData: any;
  isActive: boolean;
}

interface InterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  interviewerId: string;
  interviewerName: string;
  date: string;
  duration: number;
  type: 'phone' | 'video' | 'onsite';
  status: 'scheduled' | 'in-progress' | 'completed' | 'analyzed';
  aiAnalysis?: AIAnalysis;
}

interface AIAnalysis {
  communicationScore: number;
  technicalScore: number;
  problemSolvingScore: number;
  culturalFitScore: number;
  overallScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  keyInsights: string[];
  recommendations: string[];
  bodyLanguageAnalysis?: {
    eyeContact: number;
    posture: number;
    gestures: number;
    confidence: number;
  };
  speechAnalysis?: {
    clarity: number;
    pace: number;
    tone: number;
    articulation: number;
  };
  technicalEvaluation?: {
    codeQuality: number;
    problemSolving: number;
    knowledgeDepth: number;
    learningAbility: number;
  };
}

interface Question {
  id: string;
  text: string;
  category: 'technical' | 'behavioral' | 'problem-solving' | 'culture-fit';
  difficulty: 'easy' | 'medium' | 'hard';
  response?: string;
  score?: number;
  aiFeedback?: string;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'Can you walk us through your experience with React and state management?',
    category: 'technical',
    difficulty: 'medium'
  },
  {
    id: '2',
    text: 'Describe a challenging project you worked on and how you overcame obstacles.',
    category: 'behavioral',
    difficulty: 'medium'
  },
  {
    id: '3',
    text: 'How would you optimize a slow database query?',
    category: 'problem-solving',
    difficulty: 'hard'
  },
  {
    id: '4',
    text: 'What\'s your approach to code review and collaboration?',
    category: 'culture-fit',
    difficulty: 'easy'
  },
  {
    id: '5',
    text: 'Explain the difference between REST and GraphQL APIs.',
    category: 'technical',
    difficulty: 'medium'
  }
];

export function InterviewAssessmentStep({ onComplete, onBack, workflowData, isActive }: InterviewAssessmentStepProps) {
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [currentInterview, setCurrentInterview] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [viewMode, setViewMode] = useState<'live' | 'analysis' | 'summary'>('live');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  // Load interviews from previous step
  useEffect(() => {
    if (workflowData.step4?.scheduledInterviews) {
      const interviewSessions = workflowData.step4.scheduledInterviews.map((slot: any) => ({
        id: `interview-${slot.id}`,
        candidateId: slot.candidateId,
        candidateName: slot.candidateName,
        interviewerId: 'interviewer-1',
        interviewerName: slot.interviewer,
        date: slot.date,
        duration: slot.duration,
        type: slot.type,
        status: 'scheduled' as const
      }));
      setInterviews(interviewSessions);
    }
    
    setQuestions(mockQuestions);
  }, [workflowData]);

  // Timer for recording
  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isRecording]);

  const startInterview = (interview: InterviewSession) => {
    setCurrentInterview({ ...interview, status: 'in-progress' });
    setCurrentQuestionIndex(0);
    setRecordingTime(0);
    setViewMode('live');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Interview completed
      if (currentInterview) {
        setCurrentInterview({ ...currentInterview, status: 'completed' });
        setViewMode('analysis');
        startAnalysis();
      }
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate AI analysis progress
    const analysisSteps = [
      'Processing audio/video data...',
      'Analyzing speech patterns...',
      'Evaluating body language...',
      'Assessing technical responses...',
      'Calculating overall scores...',
      'Generating insights...'
    ];
    
    for (let i = 0; i < analysisSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress(((i + 1) / analysisSteps.length) * 100);
    }
    
    // Mock AI analysis results
    const aiAnalysis: AIAnalysis = {
      communicationScore: 85,
      technicalScore: 92,
      problemSolvingScore: 88,
      culturalFitScore: 90,
      overallScore: 89,
      sentiment: 'positive',
      keyInsights: [
        'Strong technical knowledge demonstrated',
        'Excellent communication skills',
        'Good problem-solving approach',
        'Positive attitude and cultural fit'
      ],
      recommendations: [
        'Consider for next round',
        'Strong candidate for technical role',
        'Good team collaboration potential'
      ],
      bodyLanguageAnalysis: {
        eyeContact: 85,
        posture: 90,
        gestures: 80,
        confidence: 88
      },
      speechAnalysis: {
        clarity: 87,
        pace: 85,
        tone: 90,
        articulation: 88
      },
      technicalEvaluation: {
        codeQuality: 92,
        problemSolving: 88,
        knowledgeDepth: 90,
        learningAbility: 85
      }
    };
    
    if (currentInterview) {
      setCurrentInterview({ 
        ...currentInterview, 
        status: 'analyzed',
        aiAnalysis 
      });
    }
    
    setIsAnalyzing(false);
    setViewMode('summary');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10b981';
      case 'neutral': return '#6b7280';
      case 'negative': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleComplete = () => {
    const stepData = {
      interviews: interviews.filter(i => i.status === 'analyzed'),
      analytics: {
        totalInterviews: interviews.length,
        completedInterviews: interviews.filter(i => i.status === 'analyzed').length,
        averageScore: interviews
          .filter(i => i.aiAnalysis)
          .reduce((acc, i) => acc + (i.aiAnalysis?.overallScore || 0), 0) / 
          interviews.filter(i => i.aiAnalysis).length || 0
      },
      timestamp: new Date().toISOString()
    };
    onComplete(stepData);
  };

  if (!currentInterview) {
    return (
      <div className="space-y-8">
        {/* Step Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard glow={true}>
            <div className="flex items-center gap-4 mb-6">
              <div className="text-6xl">🎤</div>
              <div>
                <h2 className="text-3xl font-bold text-hologram">
                  Step 5: AI-Powered Interview Assessment
                </h2>
                <p className="text-white/70 mt-2">
                  Multimodal analysis with real-time AI evaluation and scoring
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">
                  <AnimatedCounter value={interviews.length} />
                </div>
                <div className="text-white/60 text-sm">Total Interviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  <AnimatedCounter value={interviews.filter(i => i.status === 'analyzed').length} />
                </div>
                <div className="text-white/60 text-sm">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">
                  <AnimatedCounter value={interviews.filter(i => i.status === 'in-progress').length} />
                </div>
                <div className="text-white/60 text-sm">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-electric-400">
                  <AnimatedCounter value={interviews.filter(i => i.status === 'scheduled').length} />
                </div>
                <div className="text-white/60 text-sm">Scheduled</div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Interview List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview, index) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard>
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    {interview.type === 'video' ? '📹' : interview.type === 'phone' ? '📞' : '🏢'}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{interview.candidateName}</h3>
                  <p className="text-sm text-white/60 mb-3">
                    {new Date(interview.date).toLocaleDateString()} • {interview.duration}min
                  </p>
                  
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      interview.status === 'analyzed' ? 'bg-emerald-500/20 text-emerald-400' :
                      interview.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                      interview.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {interview.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  {interview.status === 'scheduled' && (
                    <HolographicButton
                      variant="primary"
                      onClick={() => startInterview(interview)}
                      className="w-full"
                    >
                      Start Interview
                    </HolographicButton>
                  )}
                  
                  {interview.status === 'analyzed' && interview.aiAnalysis && (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold" style={{ color: getScoreColor(interview.aiAnalysis.overallScore) }}>
                        {interview.aiAnalysis.overallScore}%
                      </div>
                      <div className="text-xs text-white/60">Overall Score</div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Interview Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard glow={true}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">
                {currentInterview.type === 'video' ? '📹' : currentInterview.type === 'phone' ? '📞' : '🏢'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-hologram">
                  Interview with {currentInterview.candidateName}
                </h2>
                <p className="text-white/70">
                  {currentInterview.interviewerName} • {new Date(currentInterview.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="text-center">
                <div className="text-lg font-bold text-primary-400">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-xs text-white/60">Duration</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-400">
                  {currentQuestionIndex + 1}/{questions.length}
                </div>
                <div className="text-xs text-white/60">Questions</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video/Audio Feed */}
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="relative">
              {viewMode === 'live' && (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-64 bg-black rounded-lg"
                  />
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <HolographicButton
                      variant={isRecording ? "error" : "primary"}
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? '⏹️ Stop' : '🔴 Record'}
                    </HolographicButton>
                  </div>
                  
                  {isRecording && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                      🔴 REC
                    </div>
                  )}
                </>
              )}
              
              {viewMode === 'analysis' && (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <ProgressRing
                      progress={analysisProgress}
                      size={120}
                      strokeWidth={8}
                      className="mb-4"
                    />
                    <p className="text-white/70">AI Analysis in Progress...</p>
                  </div>
                </div>
              )}
              
              {viewMode === 'summary' && currentInterview.aiAnalysis && (
                <div className="h-64 bg-gradient-to-br from-primary-500/10 to-emerald-500/10 rounded-lg p-6">
                  <div className="grid grid-cols-2 gap-6 h-full">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-primary-400 mb-2">Communication</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-1000"
                              style={{ 
                                width: `${currentInterview.aiAnalysis.communicationScore}%`,
                                backgroundColor: getScoreColor(currentInterview.aiAnalysis.communicationScore)
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold">
                            {currentInterview.aiAnalysis.communicationScore}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-emerald-400 mb-2">Technical</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-1000"
                              style={{ 
                                width: `${currentInterview.aiAnalysis.technicalScore}%`,
                                backgroundColor: getScoreColor(currentInterview.aiAnalysis.technicalScore)
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold">
                            {currentInterview.aiAnalysis.technicalScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-amber-400 mb-2">Problem Solving</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-1000"
                              style={{ 
                                width: `${currentInterview.aiAnalysis.problemSolvingScore}%`,
                                backgroundColor: getScoreColor(currentInterview.aiAnalysis.problemSolvingScore)
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold">
                            {currentInterview.aiAnalysis.problemSolvingScore}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-electric-400 mb-2">Cultural Fit</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-1000"
                              style={{ 
                                width: `${currentInterview.aiAnalysis.culturalFitScore}%`,
                                backgroundColor: getScoreColor(currentInterview.aiAnalysis.culturalFitScore)
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold">
                            {currentInterview.aiAnalysis.culturalFitScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Questions & Controls */}
        <div>
          <GlassCard>
            {viewMode === 'live' && (
              <>
                <h3 className="text-lg font-semibold mb-4 text-primary-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                
                <div className="mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    questions[currentQuestionIndex].category === 'technical' ? 'bg-blue-500/20 text-blue-400' :
                    questions[currentQuestionIndex].category === 'behavioral' ? 'bg-green-500/20 text-green-400' :
                    questions[currentQuestionIndex].category === 'problem-solving' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {questions[currentQuestionIndex].category.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                
                <p className="text-white/90 mb-6 leading-relaxed">
                  {questions[currentQuestionIndex].text}
                </p>
                
                <div className="space-y-3">
                  <HolographicButton
                    variant="secondary"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="w-full"
                  >
                    ← Previous Question
                  </HolographicButton>
                  
                  <HolographicButton
                    variant="primary"
                    onClick={nextQuestion}
                    className="w-full"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Complete Interview' : 'Next Question →'}
                  </HolographicButton>
                </div>
              </>
            )}
            
            {viewMode === 'summary' && currentInterview.aiAnalysis && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-400">AI Insights</h3>
                
                <div className="space-y-3">
                  {currentInterview.aiAnalysis.keyInsights.map((insight, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-sm text-white/80">💡 {insight}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold text-emerald-400 mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {currentInterview.aiAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm text-white/70">
                        • {rec}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2" style={{ color: getScoreColor(currentInterview.aiAnalysis.overallScore) }}>
                      {currentInterview.aiAnalysis.overallScore}%
                    </div>
                    <div className="text-sm text-white/60">Overall Assessment Score</div>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <HolographicButton
          variant="secondary"
          onClick={() => {
            setCurrentInterview(null);
            setViewMode('live');
            setCurrentQuestionIndex(0);
            setRecordingTime(0);
          }}
        >
          ← Back to Interviews
        </HolographicButton>
        
        {viewMode === 'summary' && (
          <HolographicButton
            variant="primary"
            onClick={handleComplete}
          >
            Proceed to Background Check →
          </HolographicButton>
        )}
      </div>
    </div>
  );
} 