import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';

interface HiringRequestAgentProps {
  user: any;
  isActive: boolean;
  onStatusChange: (status: string) => void;
}

export function HiringRequestAgent({ user, isActive, onStatusChange }: HiringRequestAgentProps) {
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    manager: '',
    level: '',
    salaryRange: '',
    location: '',
    urgency: 'medium',
    type: 'permanent'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Hiring request submitted:', formData);
    onStatusChange('processing');

    // Simulate approval process
    setTimeout(() => {
      onStatusChange('active');
      alert('Hiring request submitted for approval!');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">📝</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">
                Hiring Request Agent
              </h2>
              <p className="text-white/70 mt-2">
                Intelligent hiring request creation with approval workflow
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="engineering">Engineering</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Hiring Manager
                </label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({...formData, manager: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
                  placeholder="Manager name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({...formData, salaryRange: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
                  placeholder="e.g. $80,000 - $120,000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
                  placeholder="e.g. Remote, New York, San Francisco"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Urgency
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Employment Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
                >
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <HolographicButton
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Submit for Approval
              </HolographicButton>
              
              <HolographicButton
                type="button"
                variant="secondary"
                onClick={() => setFormData({
                  jobTitle: '',
                  department: '',
                  manager: '',
                  level: '',
                  salaryRange: '',
                  location: '',
                  urgency: 'medium',
                  type: 'permanent'
                })}
              >
                Reset Form
              </HolographicButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}