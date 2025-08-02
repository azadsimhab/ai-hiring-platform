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

const screeningApi = {
  // Create new screening session
  createScreening: async (screeningData) => {
    try {
      const response = await api.post('/api/v1/multimodal-screening/sessions', screeningData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create screening session' };
    }
  },

  // Get screening session
  getScreening: async (sessionId) => {
    try {
      const response = await api.get(`/api/v1/multimodal-screening/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch screening session' };
    }
  },

  // Get all screening sessions
  getAllScreenings: async (params = {}) => {
    try {
      const response = await api.get('/api/v1/multimodal-screening/sessions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch screening sessions' };
    }
  },

  // Upload video response
  uploadVideoResponse: async (sessionId, questionId, videoFile) => {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('question_id', questionId);

      const response = await api.post(`/api/v1/multimodal-screening/sessions/${sessionId}/video-response`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload video response' };
    }
  },

  // Upload audio response
  uploadAudioResponse: async (sessionId, questionId, audioFile) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('question_id', questionId);

      const response = await api.post(`/api/v1/multimodal-screening/sessions/${sessionId}/audio-response`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload audio response' };
    }
  },

  // Submit text response
  submitTextResponse: async (sessionId, questionId, textResponse) => {
    try {
      const response = await api.post(`/api/v1/multimodal-screening/sessions/${sessionId}/text-response`, {
        question_id: questionId,
        response: textResponse,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to submit text response' };
    }
  },

  // Get screening questions
  getQuestions: async (sessionId) => {
    try {
      const response = await api.get(`/api/v1/multimodal-screening/sessions/${sessionId}/questions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch questions' };
    }
  },

  // Complete screening session
  completeScreening: async (sessionId) => {
    try {
      const response = await api.post(`/api/v1/multimodal-screening/sessions/${sessionId}/complete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to complete screening' };
    }
  },

  // Get screening results
  getResults: async (sessionId) => {
    try {
      const response = await api.get(`/api/v1/multimodal-screening/sessions/${sessionId}/results`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch screening results' };
    }
  },

  // Get AI analysis
  getAIAnalysis: async (sessionId) => {
    try {
      const response = await api.get(`/api/v1/multimodal-screening/sessions/${sessionId}/ai-analysis`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch AI analysis' };
    }
  },

  // Delete screening session
  deleteScreening: async (sessionId) => {
    try {
      const response = await api.delete(`/api/v1/multimodal-screening/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete screening session' };
    }
  },

  // Get screening statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/api/v1/multimodal-screening/statistics');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch statistics' };
    }
  }
};

export default screeningApi; 