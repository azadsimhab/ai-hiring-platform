import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../ui/GlassCard';
import { HolographicButton } from '../../ui/HolographicButton';

export function ResumeScannerAgent({ user, isActive, onStatusChange }: any) {
  const [files, setFiles] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const scanResumes = async () => {
    setIsScanning(true);
    onStatusChange('processing');
    
    // Simulate scanning
    setTimeout(() => {
      const mockResults = files.map((file, index) => ({
        name: file.name,
        score: Math.floor(Math.random() * 30) + 70,
        skills: ['React', 'TypeScript', 'Node.js'],
        experience: `${Math.floor(Math.random() * 8) + 2} years`
      }));
      setResults(mockResults);
      setIsScanning(false);
      onStatusChange('active');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">📈</div>
            <div>
              <h2 className="text-3xl font-bold text-hologram">Resume Scanner Agent</h2>
              <p className="text-white/70 mt-2">Intelligent resume analysis and candidate scoring</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <GlassCard>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Upload Resumes</label>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-primary-400 focus:outline-none text-white"
            />
          </div>
          
          {files.length > 0 && (
            <div>
              <p className="text-white/70 mb-2">{files.length} files selected</p>
              <HolographicButton
                variant="primary"
                onClick={scanResumes}
                disabled={isScanning}
                className="w-full"
              >
                {isScanning ? '🔍 Scanning...' : '✨ Scan Resumes'}
              </HolographicButton>
            </div>
          )}
          
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary-400">Scan Results</h3>
              {results.map((result, index) => (
                <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white">{result.name}</h4>
                    <span className="text-emerald-400 font-bold">{result.score}%</span>
                  </div>
                  <p className="text-white/60 text-sm mb-1">Experience: {result.experience}</p>
                  <p className="text-white/60 text-sm">Skills: {result.skills.join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}