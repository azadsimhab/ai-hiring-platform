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

const jdGeneratorApi = {
  // Generate job description
  generateJD: async (requirements) => {
    try {
      const response = await api.post('/api/v1/jd-generator/generate', requirements);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate job description' };
    }
  },

  // Get generated job descriptions
  getAllJDs: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/jd-generator/jobs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch job descriptions' };
    }
  },

  // Get single job description
  getJD: async (jdId) => {
    try {
      const response = await api.get(`/api/v1/jd-generator/jobs/${jdId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch job description' };
    }
  },

  // Save job description
  saveJD: async (jdData) => {
    try {
      const response = await api.post('/api/v1/jd-generator/jobs', jdData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to save job description' };
    }
  },

  // Update job description
  updateJD: async (jdId, jdData) => {
    try {
      const response = await api.put(`/api/v1/jd-generator/jobs/${jdId}`, jdData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update job description' };
    }
  },

  // Delete job description
  deleteJD: async (jdId) => {
    try {
      const response = await api.delete(`/api/v1/jd-generator/jobs/${jdId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete job description' };
    }
  },

  // Get JD templates
  getTemplates: async () => {
    try {
      const response = await api.get('/api/v1/jd-generator/templates');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch templates' };
    }
  },

  // Generate JD from template
  generateFromTemplate: async (templateId, customizations) => {
    try {
      const response = await api.post(`/api/v1/jd-generator/templates/${templateId}/generate`, customizations);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate from template' };
    }
  },

  // Optimize job description
  optimizeJD: async (jdId, optimizationParams) => {
    try {
      const response = await api.post(`/api/v1/jd-generator/jobs/${jdId}/optimize`, optimizationParams);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to optimize job description' };
    }
  },

  // Get JD analytics
  getAnalytics: async (jdId) => {
    try {
      const response = await api.get(`/api/v1/jd-generator/jobs/${jdId}/analytics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch analytics' };
    }
  },

  // Export job description
  exportJD: async (jdId, format = 'pdf') => {
    try {
      const response = await api.get(`/api/v1/jd-generator/jobs/${jdId}/export`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to export job description' };
    }
  },

  // Get JD generator statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/api/v1/jd-generator/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  }
};

export default jdGeneratorApi; 