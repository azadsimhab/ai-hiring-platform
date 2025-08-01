import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';
import { AnimatedCounter } from '../../ui/AnimatedCounter';

interface JobDescriptionStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  workflowData: any;
  isActive: boolean;
}

interface JobRequirements {
  role: string;
  department: string;
  experience: string;
  skills: string[];
  education: string;
  location: string;
  salary: string;
  workType: 'remote' | 'hybrid' | 'onsite';
}

const popularSkills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
  'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Git', 'Agile',
  'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Project Management'
];

export function JobDescriptionStep({ onComplete, onBack, workflowData, isActive }: JobDescriptionStepProps) {
  const [requirements, setRequirements] = useState<JobRequirements>({
    role: '',
    department: '',
    experience: '',
    skills: [],
    education: '',
    location: '',
    salary: '',
    workType: 'hybrid'
  });
  
  const [generatedJD, setGeneratedJD] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Load existing data if available
  useEffect(() => {
    if (workflowData.step1) {
      setRequirements(workflowData.step1.requirements);
      setGeneratedJD(workflowData.step1.jobDescription);
      setShowPreview(true);
    }
  }, [workflowData]);

  const handleSkillToggle = (skill: string) => {
    setRequirements(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const generateJobDescription = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock AI-generated job description
    const aiJobDescription = `
## ${requirements.role} - ${requirements.department}

### About the Role
We are seeking a talented ${requirements.role} to join our dynamic ${requirements.department} team. This ${requirements.workType} position offers an exciting opportunity to work with cutting-edge technologies and contribute to innovative projects that make a real impact.

### Key Responsibilities
• Design, develop, and maintain high-quality software solutions
• Collaborate with cross-functional teams to deliver exceptional user experiences
• Participate in code reviews and contribute to technical discussions
• Stay up-to-date with industry trends and best practices
• Mentor junior team members and contribute to team growth

### Required Qualifications
• ${requirements.experience} years of professional experience
• ${requirements.education} degree or equivalent experience
• Strong proficiency in: ${requirements.skills.join(', ')}
• Excellent problem-solving and analytical skills
• Strong communication and collaboration abilities

### What We Offer
• Competitive salary: ${requirements.salary}
• Flexible ${requirements.workType} work arrangement
• Comprehensive benefits package
• Professional development opportunities
• Innovation-driven work environment
• Work-life balance and career growth

### Location
${requirements.location}

Ready to join our team? Apply now and let's build the future together!
    `.trim();
    
    setGeneratedJD(aiJobDescription);
    setIsGenerating(false);
    setShowPreview(true);
  };

  const handleComplete = () => {
    const stepData = {
      requirements,
      jobDescription: generatedJD,
      timestamp: new Date().toISOString()
    };
    onComplete(stepData);
  };

  const canGenerate = requirements.role && requirements.department && 
                     requirements.experience && requirements.skills.length > 0;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard glow={true}>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">📝</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">
                Step 1: Job Description Generator
              </h2>
              <p className="text-white/70 mt-2">
                Create AI-powered job descriptions with precision targeting
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">
                <AnimatedCounter value={85} suffix="%" />
              </div>
              <div className="text-white/60 text-sm">Better Match Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                <AnimatedCounter value={3} suffix="x" />
              </div>
              <div className="text-white/60 text-sm">Faster Creation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">
                <AnimatedCounter value={92} suffix="%" />
              </div>
              <div className="text-white/60 text-sm">Quality Score</div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {!showPreview ? (
        /* Requirements Form */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <h3 className="text-xl font-semibold mb-6 text-primary-400">
              Job Requirements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-2">Job Title</label>
                <input
                  type="text"
                  value={requirements.role}
                  onChange={(e) => setRequirements(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Senior Full Stack Developer"
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-primary-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select
                  value={requirements.department}
                  onChange={(e) => setRequirements(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:border-primary-400 focus:outline-none transition-colors"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Data Science">Data Science</option>
                  <option value="DevOps">DevOps</option>
                  <option value="QA">Quality Assurance</option>
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium mb-2">Experience Level</label>
                <select
                  value={requirements.experience}
                  onChange={(e) => setRequirements(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:border-primary-400 focus:outline-none transition-colors"
                >
                  <option value="">Select Experience</option>
                  <option value="0-2">Entry Level (0-2 years)</option>
                  <option value="3-5">Mid Level (3-5 years)</option>
                  <option value="5-8">Senior Level (5-8 years)</option>
                  <option value="8+">Lead Level (8+ years)</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={requirements.location}
                  onChange={(e) => setRequirements(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. San Francisco, CA / Remote"
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-primary-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Work Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Work Type</label>
                <div className="flex gap-2">
                  {(['remote', 'hybrid', 'onsite'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setRequirements(prev => ({ ...prev, workType: type }))}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        requirements.workType === type
                          ? 'bg-primary-500/20 border-primary-400 text-primary-300'
                          : 'bg-black/30 border-white/20 text-white/70 hover:border-white/40'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium mb-2">Salary Range</label>
                <input
                  type="text"
                  value={requirements.salary}
                  onChange={(e) => setRequirements(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="e.g. $80k - $120k"
                  className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-primary-400 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Skills Selection */}
            <div className="mt-8">
              <label className="block text-sm font-medium mb-4">Required Skills</label>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-3 py-2 rounded-full text-sm border transition-all ${
                      requirements.skills.includes(skill)
                        ? 'bg-primary-500/20 border-primary-400 text-primary-300'
                        : 'bg-black/30 border-white/20 text-white/70 hover:border-white/40'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              
              {requirements.skills.length > 0 && (
                <div className="mt-4 p-4 bg-primary-500/10 border border-primary-400/30 rounded-lg">
                  <p className="text-sm text-primary-300 mb-2">Selected Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {requirements.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="mt-8 text-center">
              <HolographicButton
                variant="primary"
                size="lg"
                onClick={generateJobDescription}
                disabled={!canGenerate || isGenerating}
                className="px-12 py-4"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating with AI...
                  </div>
                ) : (
                  '🤖 Generate Job Description'
                )}
              </HolographicButton>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        /* Job Description Preview */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-emerald-400">
                ✅ AI-Generated Job Description
              </h3>
              <HolographicButton
                variant="secondary"
                size="sm"
                onClick={() => setShowPreview(false)}
              >
                Edit Requirements
              </HolographicButton>
            </div>
            
            <div className="bg-black/30 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-white/90 leading-relaxed">
                {generatedJD}
              </pre>
            </div>

            <div className="flex justify-center">
              <HolographicButton
                variant="primary"
                size="lg"
                onClick={handleComplete}
                className="px-12 py-4"
              >
                Approve & Continue →
              </HolographicButton>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}