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

const codingTestApi = {
  // Get all coding tests
  getAllTests: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/coding-test/tests', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch coding tests' };
    }
  },

  // Get single coding test
  getTest: async (testId) => {
    try {
      const response = await api.get(`/api/v1/coding-test/tests/${testId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch coding test' };
    }
  },

  // Create new coding test
  createTest: async (testData) => {
    try {
      const response = await api.post('/api/v1/coding-test/tests', testData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create coding test' };
    }
  },

  // Update coding test
  updateTest: async (testId, testData) => {
    try {
      const response = await api.put(`/api/v1/coding-test/tests/${testId}`, testData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update coding test' };
    }
  },

  // Delete coding test
  deleteTest: async (testId) => {
    try {
      const response = await api.delete(`/api/v1/coding-test/tests/${testId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete coding test' };
    }
  },

  // Submit coding test solution
  submitSolution: async (testId, solution) => {
    try {
      const response = await api.post(`/api/v1/coding-test/tests/${testId}/submit`, solution);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit solution' };
    }
  },

  // Get submission results
  getSubmissionResults: async (submissionId) => {
    try {
      const response = await api.get(`/api/v1/coding-test/submissions/${submissionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch submission results' };
    }
  },

  // Get all submissions for a test
  getTestSubmissions: async (testId, params = {}) => {
    try {
      const response = await api.get(`/api/v1/coding-test/tests/${testId}/submissions`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch test submissions' };
    }
  },

  // Run test cases
  runTestCases: async (testId, code, language) => {
    try {
      const response = await api.post(`/api/v1/coding-test/tests/${testId}/run`, {
        code,
        language,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to run test cases' };
    }
  },

  // Get anti-cheat status
  getAntiCheatStatus: async (testId) => {
    try {
      const response = await api.get(`/api/v1/coding-test/tests/${testId}/anti-cheat-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch anti-cheat status' };
    }
  },

  // Get coding test statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/api/v1/coding-test/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  }
};

export default codingTestApi; 