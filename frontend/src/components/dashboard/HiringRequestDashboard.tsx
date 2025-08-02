import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonCard } from '../ui/NeonCard';
import { HolographicButton } from '../ui/HolographicButton';
import { PureCSSBackground } from '../ui/PureCSSBackground';

interface HiringRequest {
  id: number;
  title: string;
  department: string;
  position: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  budget_range: string;
  timeline_weeks: number;
}

const statusColors = {
  draft: '#666666',
  pending: '#ffff00',
  approved: '#00ff00',
  rejected: '#ff0000'
};

const priorityColors = {
  low: '#00ff00',
  medium: '#ffff00',
  high: '#ff8000',
  urgent: '#ff0000'
};

export function HiringRequestDashboard() {
  const [requests, setRequests] = useState<HiringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch hiring requests from API
    fetchHiringRequests();
  }, []);

  const fetchHiringRequests = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/hiring-requests/');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching hiring requests:', error);
      // Mock data for development
      setRequests([
        {
          id: 1,
          title: 'Senior Full Stack Developer',
          department: 'Engineering',
          position: 'Full Stack Developer',
          status: 'pending',
          priority: 'high',
          created_at: '2024-01-15T10:00:00Z',
          budget_range: '$80k - $120k',
          timeline_weeks: 4
        },
        {
          id: 2,
          title: 'AI/ML Engineer',
          department: 'AI Research',
          position: 'Machine Learning Engineer',
          status: 'approved',
          priority: 'urgent',
          created_at: '2024-01-14T14:30:00Z',
          budget_range: '$100k - $150k',
          timeline_weeks: 6
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    urgent: requests.filter(r => r.priority === 'urgent').length
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
              Hiring Requests Dashboard
            </h1>
            <p className="text-gray-400">Manage and track all hiring requests</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <NeonCard glowColor="#00ffff">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{stats.total}</div>
                <div className="text-gray-400">Total Requests</div>
              </div>
            </NeonCard>
            
            <NeonCard glowColor="#ffff00">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
                <div className="text-gray-400">Pending</div>
              </div>
            </NeonCard>
            
            <NeonCard glowColor="#00ff00">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{stats.approved}</div>
                <div className="text-gray-400">Approved</div>
              </div>
            </NeonCard>
            
            <NeonCard glowColor="#ff0000">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{stats.urgent}</div>
                <div className="text-gray-400">Urgent</div>
              </div>
            </NeonCard>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <HolographicButton variant="primary">
              + New Request
            </HolographicButton>
          </div>

          {/* Requests List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NeonCard glowColor={statusColors[request.status]}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{request.title}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                          <div>
                            <span className="text-gray-500">Department:</span> {request.department}
                          </div>
                          <div>
                            <span className="text-gray-500">Position:</span> {request.position}
                          </div>
                          <div>
                            <span className="text-gray-500">Budget:</span> {request.budget_range}
                          </div>
                          <div>
                            <span className="text-gray-500">Timeline:</span> {request.timeline_weeks} weeks
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: `${statusColors[request.status]}20`,
                              color: statusColors[request.status],
                              border: `1px solid ${statusColors[request.status]}`
                            }}
                          >
                            {request.status.toUpperCase()}
                          </span>
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: `${priorityColors[request.priority]}20`,
                              color: priorityColors[request.priority],
                              border: `1px solid ${priorityColors[request.priority]}`
                            }}
                          >
                            {request.priority.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <HolographicButton variant="secondary" size="sm">
                            View
                          </HolographicButton>
                          <HolographicButton variant="primary" size="sm">
                            Edit
                          </HolographicButton>
                        </div>
                      </div>
                    </div>
                  </NeonCard>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredRequests.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-400"
              >
                No hiring requests found
              </motion.div>
            )}
          </div>
        </div>
      </PureCSSBackground>
    </div>
  );
} 