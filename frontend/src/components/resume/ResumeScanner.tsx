import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonCard } from '../ui/NeonCard';
import { HolographicButton } from '../ui/HolographicButton';
import { PureCSSBackground } from '../ui/PureCSSBackground';

interface Resume {
  id: number;
  file_name: string;
  file_type: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'error';
  ai_processed: boolean;
  created_at: string;
  analysis?: ResumeAnalysis;
}

interface ResumeAnalysis {
  skills: string[];
  experience_years: number;
  education: string[];
  match_score: number;
  recommendations: string[];
}

export function ResumeScanner() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:8000/api/resume-scanner/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const newResume = await response.json();
          setResumes(prev => [...prev, newResume]);
        }
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const analyzeResume = async (resumeId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/resume-scanner/analyze/${resumeId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const analysis = await response.json();
        setResumes(prev => prev.map(resume => 
          resume.id === resumeId 
            ? { ...resume, analysis, processing_status: 'completed' as const }
            : resume
        ));
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffff00';
      case 'processing': return '#ff8000';
      case 'completed': return '#00ff00';
      case 'error': return '#ff0000';
      default: return '#666666';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <PureCSSBackground>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Resume Scanner
            </h1>
            <p className="text-gray-400">AI-powered resume analysis and candidate matching</p>
          </motion.div>

          {/* Upload Section */}
          <NeonCard glowColor="#00ffff" className="mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Upload Resumes</h2>
              
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <div className="space-y-4">
                  <div className="text-6xl text-gray-400">📄</div>
                  <p className="text-gray-400">
                    Drag and drop resume files here or click to browse
                  </p>
                  <HolographicButton
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Choose Files'}
                  </HolographicButton>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX (Max 10MB per file)
              </p>
            </div>
          </NeonCard>

          {/* Resumes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumes List */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Uploaded Resumes</h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {resumes.map((resume, index) => (
                    <motion.div
                      key={resume.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NeonCard 
                        glowColor={getStatusColor(resume.processing_status)}
                        onClick={() => setSelectedResume(resume)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{resume.file_name}</h3>
                            <p className="text-sm text-gray-400">
                              {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: `${getStatusColor(resume.processing_status)}20`,
                                color: getStatusColor(resume.processing_status),
                                border: `1px solid ${getStatusColor(resume.processing_status)}`
                              }}
                            >
                              {resume.processing_status.toUpperCase()}
                            </span>
                            
                            {resume.processing_status === 'pending' && (
                              <HolographicButton
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  analyzeResume(resume.id);
                                }}
                              >
                                Analyze
                              </HolographicButton>
                            )}
                          </div>
                        </div>
                      </NeonCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {resumes.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-gray-400"
                  >
                    No resumes uploaded yet
                  </motion.div>
                )}
              </div>
            </div>

            {/* Analysis Panel */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
              
              {selectedResume ? (
                <NeonCard glowColor="#00ff00">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{selectedResume.file_name}</h3>
                      <p className="text-gray-400">
                        Analyzed on {new Date(selectedResume.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {selectedResume.analysis ? (
                      <div className="space-y-4">
                        {/* Match Score */}
                        <div>
                          <h4 className="font-semibold mb-2">Match Score</h4>
                          <div className="w-full bg-gray-700 rounded-full h-4">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500"
                              style={{ width: `${selectedResume.analysis.match_score}%` }}
                            />
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {selectedResume.analysis.match_score}% match
                          </p>
                        </div>

                        {/* Skills */}
                        <div>
                          <h4 className="font-semibold mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedResume.analysis.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Experience */}
                        <div>
                          <h4 className="font-semibold mb-2">Experience</h4>
                          <p className="text-gray-400">
                            {selectedResume.analysis.experience_years} years of experience
                          </p>
                        </div>

                        {/* Education */}
                        <div>
                          <h4 className="font-semibold mb-2">Education</h4>
                          <ul className="space-y-1">
                            {selectedResume.analysis.education.map((edu, index) => (
                              <li key={index} className="text-gray-400 text-sm">• {edu}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h4 className="font-semibold mb-2">AI Recommendations</h4>
                          <ul className="space-y-1">
                            {selectedResume.analysis.recommendations.map((rec, index) => (
                              <li key={index} className="text-gray-400 text-sm">• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        {selectedResume.processing_status === 'pending' ? (
                          <div>
                            <p>Resume ready for analysis</p>
                            <HolographicButton
                              variant="primary"
                              className="mt-4"
                              onClick={() => analyzeResume(selectedResume.id)}
                            >
                              Start Analysis
                            </HolographicButton>
                          </div>
                        ) : selectedResume.processing_status === 'processing' ? (
                          <div>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                            <p>Analyzing resume...</p>
                          </div>
                        ) : (
                          <p>No analysis available</p>
                        )}
                      </div>
                    )}
                  </div>
                </NeonCard>
              ) : (
                <NeonCard glowColor="#666666">
                  <div className="text-center py-12 text-gray-400">
                    Select a resume to view analysis
                  </div>
                </NeonCard>
              )}
            </div>
          </div>
        </div>
      </PureCSSBackground>
    </div>
  );
} 