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

const hiringRequestsApi = {
  // Get all hiring requests
  getAllRequests: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/hiring-requests', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch hiring requests' };
    }
  },

  // Get single hiring request
  getRequest: async (id) => {
    try {
      const response = await api.get(`/api/v1/hiring-requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch hiring request' };
    }
  },

  // Create new hiring request
  createRequest: async (requestData) => {
    try {
      const response = await api.post('/api/v1/hiring-requests', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create hiring request' };
    }
  },

  // Update hiring request
  updateRequest: async (id, requestData) => {
    try {
      const response = await api.put(`/api/v1/hiring-requests/${id}`, requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update hiring request' };
    }
  },

  // Delete hiring request
  deleteRequest: async (id) => {
    try {
      const response = await api.delete(`/api/v1/hiring-requests/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete hiring request' };
    }
  },

  // Get hiring request statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/api/v1/hiring-requests/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  },

  // Update request status
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/api/v1/hiring-requests/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update status' };
    }
  }
};

export default hiringRequestsApi; 