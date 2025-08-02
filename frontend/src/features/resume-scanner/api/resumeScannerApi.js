import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const resumeScannerApi = {
  // Upload and scan resume
  scanResume: async (file, jobDescription = '') => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription) {
        formData.append('job_description', jobDescription);
      }

      const response = await api.post('/api/v1/resume-scanner/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to scan resume' };
    }
  },

  // Get scan results
  getScanResults: async (scanId) => {
    try {
      const response = await api.get(`/api/v1/resume-scanner/results/${scanId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch scan results' };
    }
  },

  // Get all scans
  getAllScans: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/resume-scanner/scans', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch scans' };
    }
  },

  // Compare multiple resumes
  compareResumes: async (resumeIds, jobDescription = '') => {
    try {
      const response = await api.post('/api/v1/resume-scanner/compare', {
        resume_ids: resumeIds,
        job_description: jobDescription,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to compare resumes' };
    }
  },

  // Get top candidates
  getTopCandidates: async (jobDescription, limit = 10) => {
    try {
      const response = await api.post('/api/v1/resume-scanner/top-candidates', {
        job_description: jobDescription,
        limit,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get top candidates' };
    }
  },

  // Get skill match analysis
  getSkillMatchAnalysis: async (resumeId, jobDescription) => {
    try {
      const response = await api.post('/api/v1/resume-scanner/skill-match', {
        resume_id: resumeId,
        job_description: jobDescription,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to analyze skill match' };
    }
  },

  // Delete scan
  deleteScan: async (scanId) => {
    try {
      const response = await api.delete(`/api/v1/resume-scanner/scans/${scanId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete scan' };
    }
  },

  // Get scan statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/api/v1/resume-scanner/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  }
};

export default resumeScannerApi; 