import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../ui/GlassCard';
import { HolographicButton } from '../ui/HolographicButton';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { ProgressRing } from '../ui/ProgressRing';
import { PureCSSBackground } from '../ui/PureCSSBackground';

// Step Components
import { JobDescriptionStep } from './steps/JobDescriptionStep';
import { ResumeScannerStep } from './steps/ResumeScannerStep';
import { CandidateMatchingStep } from './steps/CandidateMatchingStep';
import { InterviewSchedulerStep } from './steps/InterviewSchedulerStep';
import { InterviewAssessmentStep } from './steps/InterviewAssessmentStep';
import { BackgroundVerificationStep } from './steps/BackgroundVerificationStep';
import { FinalDecisionStep } from './steps/FinalDecisionStep';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  estimatedTime: string;
  aiPowered: boolean;
}

const workflowSteps: WorkflowStep[] = [
  {
    id: 1,
    title: 'Job Description',
    description: 'AI-generated job descriptions with skill requirements',
    icon: '📝',
    status: 'pending',
    estimatedTime: '5 min',
    aiPowered: true
  },
  {
    id: 2,
    title: 'Resume Scanner',
    description: 'Intelligent resume parsing and skill extraction',
    icon: '🔍',
    status: 'pending',
    estimatedTime: '10 min',
    aiPowered: true
  },
  {
    id: 3,
    title: 'Candidate Matching',
    description: 'AI-powered candidate scoring and ranking',
    icon: '🎯',
    status: 'pending',
    estimatedTime: '15 min',
    aiPowered: true
  },
  {
    id: 4,
    title: 'Interview Scheduler',
    description: 'Smart scheduling with calendar integration',
    icon: '📅',
    status: 'pending',
    estimatedTime: '8 min',
    aiPowered: false
  },
  {
    id: 5,
    title: 'Interview Assessment',
    description: 'AI-powered video and voice analysis',
    icon: '🎥',
    status: 'pending',
    estimatedTime: '20 min',
    aiPowered: true
  },
  {
    id: 6,
    title: 'Background Verification',
    description: 'Automated reference and credential checks',
    icon: '🔒',
    status: 'pending',
    estimatedTime: '12 min',
    aiPowered: true
  },
  {
    id: 7,
    title: 'Final Decision',
    description: 'Comprehensive candidate evaluation dashboard',
    icon: '✅',
    status: 'pending',
    estimatedTime: '10 min',
    aiPowered: true
  }
];

export function HiringWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(workflowSteps);
  const [workflowData, setWorkflowData] = useState<any>({});
  
  // Update step status when current step changes
  useEffect(() => {
    setSteps(prev => prev.map(step => ({
      ...step,
      status: step.id < currentStep ? 'completed' : 
              step.id === currentStep ? 'in-progress' : 'pending'
    })));
  }, [currentStep]);

  const handleStepComplete = (stepId: number, data: any) => {
    setWorkflowData((prev: any) => ({ ...prev, [`step${stepId}`]: data }));
    if (stepId < 7) {
      setCurrentStep(stepId + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepComponent = (stepId: number) => {
    const commonProps = {
      onComplete: (data: any) => handleStepComplete(stepId, data),
      onBack: handleStepBack,
      workflowData,
      isActive: currentStep === stepId
    };

    switch (stepId) {
      case 1: return <JobDescriptionStep {...commonProps} />;
      case 2: return <ResumeScannerStep {...commonProps} />;
      case 3: return <CandidateMatchingStep {...commonProps} />;
      case 4: return <InterviewSchedulerStep {...commonProps} />;
      case 5: return <InterviewAssessmentStep {...commonProps} />;
      case 6: return <BackgroundVerificationStep {...commonProps} />;
      case 7: return <FinalDecisionStep {...commonProps} />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <PureCSSBackground>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-display font-bold mb-4 text-hologram">
              AI Hiring Workflow
            </h1>
            <p className="text-xl text-white/80 mb-6">
              Complete 7-step hiring process powered by artificial intelligence
            </p>
            
            {/* Progress Overview */}
            <div className="flex items-center gap-6 mb-8">
              <ProgressRing 
                progress={progressPercentage} 
                size={80} 
                strokeWidth={6}
                className="text-primary-400"
              />
              <div>
                <div className="text-2xl font-bold text-primary-400">
                  <AnimatedCounter value={completedSteps} /> / {steps.length}
                </div>
                <div className="text-white/60">Steps Completed</div>
              </div>
              <div className="ml-auto">
                <div className="text-2xl font-bold text-emerald-400">
                  <AnimatedCounter value={Math.round(progressPercentage)} suffix="%" />
                </div>
                <div className="text-white/60">Progress</div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Step Navigation */}
            <div className="lg:col-span-1">
              <GlassCard className="sticky top-8">
                <h3 className="text-xl font-semibold mb-6 text-primary-400">
                  Workflow Steps
                </h3>
                
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative cursor-pointer transition-all duration-300 ${
                        currentStep === step.id ? 'scale-105' : 'hover:scale-102'
                      }`}
                      onClick={() => {
                        if (step.status === 'completed' || step.id <= currentStep) {
                          setCurrentStep(step.id);
                        }
                      }}
                    >
                      <div
                        className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                          currentStep === step.id
                            ? 'bg-primary-500/20 border-primary-400 shadow-glow'
                            : step.status === 'completed'
                            ? 'bg-emerald-500/10 border-emerald-400'
                            : 'bg-white/5 border-white/20 hover:border-white/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{step.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm">
                              {step.title}
                            </div>
                            <div className="text-xs text-white/60 mt-1">
                              {step.estimatedTime}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {step.aiPowered && (
                              <div className="text-xs px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full">
                                AI
                              </div>
                            )}
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getStatusColor(step.status) }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Step connector line */}
                      {step.id < steps.length && (
                        <div
                          className={`absolute left-6 top-full w-0.5 h-4 transition-colors duration-300 ${
                            step.status === 'completed' ? 'bg-emerald-400' : 'bg-white/20'
                          }`}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {getStepComponent(currentStep)}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls */}
              <motion.div
                className="flex justify-between items-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <HolographicButton
                  variant="secondary"
                  onClick={handleStepBack}
                  disabled={currentStep === 1}
                  className="px-6 py-3"
                >
                  ← Previous Step
                </HolographicButton>

                <div className="flex items-center gap-4">
                  <span className="text-white/60">
                    Step {currentStep} of {steps.length}
                  </span>
                  <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-400 to-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>

                <HolographicButton
                  variant="primary"
                  disabled={currentStep === 7 && steps[6].status !== 'completed'}
                  className="px-6 py-3"
                >
                  {currentStep === 7 ? 'Complete Workflow' : 'Next Step →'}
                </HolographicButton>
              </motion.div>
            </div>
          </div>
        </div>
      </PureCSSBackground>
    </div>
  );
}