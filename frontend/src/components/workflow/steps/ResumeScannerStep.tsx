import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';
import { AnimatedCounter } from '../../ui/AnimatedCounter';
import { ProgressRing } from '../../ui/ProgressRing';

interface ResumeScannerStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  workflowData: any;
  isActive: boolean;
}

interface Resume {
  id: string;
  file: File;
  fileName: string;
  uploadProgress: number;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  analysis?: ResumeAnalysis;
}

interface ResumeAnalysis {
  candidateName: string;
  email: string;
  phone: string;
  skills: string[];
  experience: number;
  education: string[];
  matchScore: number;
  keyHighlights: string[];
  potentialConcerns: string[];
  overallRating: 'excellent' | 'good' | 'fair' | 'poor';
}

const mockAnalyses: ResumeAnalysis[] = [
  {
    candidateName: "Alex Chen",
    email: "alex.chen@email.com",
    phone: "+1 (555) 123-4567",
    skills: ["React", "TypeScript", "Node.js", "AWS", "Docker", "GraphQL"],
    experience: 5,
    education: ["B.S. Computer Science - Stanford University", "AWS Certified Solutions Architect"],
    matchScore: 92,
    keyHighlights: [
      "5+ years React/TypeScript experience",
      "Led team of 8 developers at TechCorp",
      "Reduced application load time by 60%",
      "Strong system design background"
    ],
    potentialConcerns: [
      "No Python experience mentioned",
      "Limited data science background"
    ],
    overallRating: "excellent"
  },
  {
    candidateName: "Sarah Rodriguez",
    email: "s.rodriguez@email.com",
    phone: "+1 (555) 987-6543",
    skills: ["JavaScript", "React", "Python", "Machine Learning", "TensorFlow"],
    experience: 3,
    education: ["B.S. Computer Engineering - MIT", "Machine Learning Specialization - Coursera"],
    matchScore: 87,
    keyHighlights: [
      "Strong ML/AI background",
      "Full-stack development experience",
      "Published research papers",
      "Open source contributor"
    ],
    potentialConcerns: [
      "Limited senior-level experience",
      "No cloud platform certifications"
    ],
    overallRating: "good"
  }
];

export function ResumeScannerStep({ onComplete, onBack, workflowData, isActive }: ResumeScannerStepProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing data if available
  useEffect(() => {
    if (workflowData.step2?.resumes) {
      setResumes(workflowData.step2.resumes);
    }
  }, [workflowData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newResumes: Resume[] = Array.from(files).map((file, index) => ({
      id: `resume-${Date.now()}-${index}`,
      file,
      fileName: file.name,
      uploadProgress: 0,
      status: 'uploading'
    }));

    setResumes(prev => [...prev, ...newResumes]);

    // Simulate upload progress
    newResumes.forEach((resume, index) => {
      const interval = setInterval(() => {
        setResumes(prev => prev.map(r => {
          if (r.id === resume.id) {
            const newProgress = Math.min(r.uploadProgress + 10, 100);
            return {
              ...r,
              uploadProgress: newProgress,
              status: newProgress === 100 ? 'completed' : 'uploading'
            };
          }
          return r;
        }));
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        setResumes(prev => prev.map(r => 
          r.id === resume.id ? { ...r, status: 'completed' } : r
        ));
      }, 2000 + index * 500);
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeResume = async (resumeId: string) => {
    setIsAnalyzing(true);
    
    setResumes(prev => prev.map(r => 
      r.id === resumeId ? { ...r, status: 'analyzing' } : r
    ));

    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Use mock analysis data
    const mockAnalysis = mockAnalyses[Math.floor(Math.random() * mockAnalyses.length)];
    
    setResumes(prev => prev.map(r => 
      r.id === resumeId ? { ...r, status: 'completed', analysis: mockAnalysis } : r
    ));

    setIsAnalyzing(false);
  };

  const analyzeAllResumes = async () => {
    const completedResumes = resumes.filter(r => r.status === 'completed' && !r.analysis);
    
    for (const resume of completedResumes) {
      await analyzeResume(resume.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'analyzing': return '#3b82f6';
      case 'uploading': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
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

  const analyzedResumes = resumes.filter(r => r.analysis);
  const avgMatchScore = analyzedResumes.length > 0 
    ? Math.round(analyzedResumes.reduce((sum, r) => sum + (r.analysis?.matchScore || 0), 0) / analyzedResumes.length)
    : 0;

  const handleComplete = () => {
    const stepData = {
      resumes: resumes.filter(r => r.analysis),
      analytics: {
        totalResumes: resumes.length,
        analyzedResumes: analyzedResumes.length,
        averageMatchScore: avgMatchScore
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
                Step 2: Resume Scanner
              </h2>
              <p className="text-white/70 mt-2">
                AI-powered resume parsing and intelligent candidate analysis
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">
                <AnimatedCounter value={resumes.length} />
              </div>
              <div className="text-white/60 text-sm">Resumes Uploaded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                <AnimatedCounter value={analyzedResumes.length} />
              </div>
              <div className="text-white/60 text-sm">Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                <AnimatedCounter value={avgMatchScore} suffix="%" />
              </div>
              <div className="text-white/60 text-sm">Avg Match Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-electric-400">
                <AnimatedCounter value={95} suffix="%" />
              </div>
              <div className="text-white/60 text-sm">Accuracy Rate</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload & Resume List */}
        <div className="space-y-6">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <h3 className="text-xl font-semibold mb-4 text-primary-400">
                Upload Resumes
              </h3>
              
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <div className="space-y-4">
                  <div className="text-6xl text-white/40">📄</div>
                  <p className="text-white/60">
                    Drag and drop resume files here or click to browse
                  </p>
                  <HolographicButton
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Files
                  </HolographicButton>
                </div>
              </div>
              
              <p className="text-xs text-white/50 mt-4 text-center">
                Supported formats: PDF, DOC, DOCX (Max 10MB per file)
              </p>
            </GlassCard>
          </motion.div>

          {/* Resume List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-primary-400">
                  Resume Queue
                </h3>
                {resumes.filter(r => r.status === 'completed' && !r.analysis).length > 0 && (
                  <HolographicButton
                    variant="secondary"
                    size="sm"
                    onClick={analyzeAllResumes}
                    disabled={isAnalyzing}
                  >
                    🤖 Analyze All
                  </HolographicButton>
                )}
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {resumes.map((resume, index) => (
                    <motion.div
                      key={resume.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border backdrop-blur-sm cursor-pointer transition-all ${
                        selectedResume?.id === resume.id
                          ? 'bg-primary-500/20 border-primary-400'
                          : 'bg-white/5 border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => setSelectedResume(resume)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm truncate">
                            {resume.fileName}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getStatusColor(resume.status) }}
                            />
                            <span className="text-xs text-white/60 capitalize">
                              {resume.status}
                            </span>
                            {resume.analysis && (
                              <span className="text-xs text-emerald-400 ml-2">
                                {resume.analysis.matchScore}% match
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {resume.status === 'uploading' && (
                            <div className="w-12">
                              <ProgressRing 
                                progress={resume.uploadProgress} 
                                size={24} 
                                strokeWidth={2}
                              />
                            </div>
                          )}
                          
                          {resume.status === 'completed' && !resume.analysis && (
                            <HolographicButton
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e?.stopPropagation();
                                analyzeResume(resume.id);
                              }}
                              disabled={isAnalyzing}
                            >
                              Analyze
                            </HolographicButton>
                          )}
                          
                          {resume.analysis && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getRatingColor(resume.analysis.overallRating) }}
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {resumes.length === 0 && (
                  <div className="text-center py-8 text-white/50">
                    No resumes uploaded yet
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Analysis Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="h-full">
            <h3 className="text-xl font-semibold mb-4 text-primary-400">
              Analysis Results
            </h3>
            
            {selectedResume?.analysis ? (
              <div className="space-y-6">
                {/* Candidate Info */}
                <div>
                  <h4 className="font-semibold text-lg text-white mb-2">
                    {selectedResume.analysis.candidateName}
                  </h4>
                  <div className="space-y-1 text-sm text-white/70">
                    <p>📧 {selectedResume.analysis.email}</p>
                    <p>📱 {selectedResume.analysis.phone}</p>
                    <p>🎓 {selectedResume.analysis.experience} years experience</p>
                  </div>
                </div>

                {/* Match Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Match Score</h4>
                    <span className="text-lg font-bold text-emerald-400">
                      {selectedResume.analysis.matchScore}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-400 to-primary-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedResume.analysis.matchScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.analysis.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-500/20 text-primary-300 border border-primary-400/30 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Highlights */}
                <div>
                  <h4 className="font-semibold mb-2 text-emerald-400">Key Highlights</h4>
                  <ul className="space-y-1">
                    {selectedResume.analysis.keyHighlights.map((highlight, index) => (
                      <li key={index} className="text-sm text-white/80 flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Potential Concerns */}
                {selectedResume.analysis.potentialConcerns.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-amber-400">Potential Concerns</h4>
                    <ul className="space-y-1">
                      {selectedResume.analysis.potentialConcerns.map((concern, index) => (
                        <li key={index} className="text-sm text-white/80 flex items-start gap-2">
                          <span className="text-amber-400 mt-1">•</span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Overall Rating */}
                <div>
                  <h4 className="font-semibold mb-2">Overall Rating</h4>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getRatingColor(selectedResume.analysis.overallRating) }}
                    />
                    <span 
                      className="font-medium capitalize"
                      style={{ color: getRatingColor(selectedResume.analysis.overallRating) }}
                    >
                      {selectedResume.analysis.overallRating}
                    </span>
                  </div>
                </div>
              </div>
            ) : selectedResume ? (
              <div className="text-center py-12 text-white/50">
                {selectedResume.status === 'analyzing' ? (
                  <div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto mb-4"></div>
                    <p>Analyzing resume with AI...</p>
                  </div>
                ) : selectedResume.status === 'completed' ? (
                  <div>
                    <p className="mb-4">Resume ready for analysis</p>
                    <HolographicButton
                      variant="primary"
                      onClick={() => analyzeResume(selectedResume.id)}
                      disabled={isAnalyzing}
                    >
                      🤖 Start AI Analysis
                    </HolographicButton>
                  </div>
                ) : (
                  <p>Resume is being processed...</p>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-white/50">
                Select a resume to view analysis
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Complete Button */}
      {analyzedResumes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <HolographicButton
            variant="primary"
            size="lg"
            onClick={handleComplete}
            className="px-12 py-4"
          >
            Continue with {analyzedResumes.length} Candidates →
          </HolographicButton>
        </motion.div>
      )}
    </div>
  );
}