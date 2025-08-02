import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';

export function JDGenerationAgent({ user, isActive, onStatusChange }: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobDescription, setJobDescription] = useState('');

  const generateJD = async () => {
    setIsGenerating(true);
    onStatusChange('processing');
    
    // Simulate AI generation
    setTimeout(() => {
      setJobDescription(`# Senior Software Engineer\n\n## About the Role\nWe are seeking a highly skilled Senior Software Engineer to join our dynamic team...\n\n## Requirements\n- 5+ years of software development experience\n- Proficiency in React, Node.js, and TypeScript\n- Experience with cloud platforms (AWS, GCP, Azure)\n\n## Responsibilities\n- Design and develop scalable software solutions\n- Mentor junior developers\n- Collaborate with cross-functional teams`);
      setIsGenerating(false);
      onStatusChange('active');
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">📄</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">JD Generation Agent</h2>
              <p className="text-white/70 mt-2">AI-powered job description creation with market intelligence</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <GlassCard>
        <div className="space-y-4">
          <HolographicButton
            variant="primary"
            onClick={generateJD}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? '🤖 Generating JD...' : '✨ Generate Job Description'}
          </HolographicButton>
          
          {jobDescription && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-primary-400 mb-4">Generated Job Description</h3>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <pre className="text-white/90 whitespace-pre-wrap text-sm">{jobDescription}</pre>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}