import axios from 'axios';
import { API_BASE_URL } from '../../../config/constants';

const JD_API_URL = `${API_BASE_URL}/job-descriptions`;

/**
 * Create a new job description
 * @param {Object} jobDescription - The job description data
 * @returns {Promise<Object>} - The created job description
 */
export const createJobDescription = async (jobDescription) => {
  try {
    const response = await axios.post(JD_API_URL, jobDescription);
    return response.data;
  } catch (error) {
    console.error('Error creating job description:', error);
    throw error;
  }
};

/**
 * Get a job description by ID
 * @param {number} id - The job description ID
 * @returns {Promise<Object>} - The job description
 */
export const getJobDescription = async (id) => {
  try {
    const response = await axios.get(`${JD_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job description with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get a list of job descriptions with optional filtering
 * @param {Object} params - Query parameters
 * @param {number} [params.skip] - Number of records to skip
 * @param {number} [params.limit] - Maximum number of records to return
 * @param {number} [params.hiring_request_id] - Filter by hiring request ID
 * @returns {Promise<Array>} - List of job descriptions
 */
export const listJobDescriptions = async (params = {}) => {
  try {
    const response = await axios.get(JD_API_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    throw error;
  }
};

/**
 * Update a job description
 * @param {number} id - The job description ID
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} - The updated job description
 */
export const updateJobDescription = async (id, updates) => {
  try {
    const response = await axios.put(`${JD_API_URL}/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating job description with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a job description
 * @param {number} id - The job description ID
 * @returns {Promise<void>}
 */
export const deleteJobDescription = async (id) => {
  try {
    await axios.delete(`${JD_API_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting job description with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Generate a job description using AI
 * @param {Object} requestData - The generation request data
 * @param {number} [requestData.hiring_request_id] - Associated hiring request ID
 * @param {string} requestData.job_title - Job title
 * @param {string} requestData.department - Department
 * @param {string} requestData.experience_level - Experience level
 * @param {Array<string>} requestData.skills_required - Required skills
 * @param {string} requestData.job_type - Job type
 * @param {string} requestData.location - Job location
 * @param {string} [requestData.additional_context] - Additional context
 * @returns {Promise<Object>} - The generated job description
 */
export const generateJobDescription = async (requestData) => {
  try {
    const response = await axios.post(`${JD_API_URL}/generate`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error generating job description:', error);
    throw error;
  }
};

/**
 * Generate interview questions for a job description
 * @param {number} jobDescriptionId - The job description ID
 * @param {Object} requestData - The generation request data
 * @param {number} [requestData.count=5] - Number of questions to generate
 * @param {Array<string>} [requestData.question_types] - Types of questions to generate
 * @param {string} [requestData.difficulty_level='medium'] - Difficulty level
 * @returns {Promise<Array>} - The generated interview questions
 */
export const generateInterviewQuestions = async (jobDescriptionId, requestData) => {
  try {
    const response = await axios.post(
      `${JD_API_URL}/${jobDescriptionId}/questions`,
      requestData
    );
    return response.data;
  } catch (error) {
    console.error(`Error generating interview questions for job description ${jobDescriptionId}:`, error);
    throw error;
  }
};

/**
 * Get interview questions for a job description
 * @param {number} jobDescriptionId - The job description ID
 * @returns {Promise<Array>} - List of interview questions
 */
export const getInterviewQuestions = async (jobDescriptionId) => {
  try {
    const response = await axios.get(`${JD_API_URL}/${jobDescriptionId}/questions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching interview questions for job description ${jobDescriptionId}:`, error);
    throw error;
  }
};

/**
 * Delete an interview question
 * @param {number} jobDescriptionId - The job description ID
 * @param {number} questionId - The question ID
 * @returns {Promise<void>}
 */
export const deleteInterviewQuestion = async (jobDescriptionId, questionId) => {
  try {
    await axios.delete(`${JD_API_URL}/${jobDescriptionId}/questions/${questionId}`);
  } catch (error) {
    console.error(`Error deleting interview question ${questionId}:`, error);
    throw error;
  }
};

export default {
  createJobDescription,
  getJobDescription,
  listJobDescriptions,
  updateJobDescription,
  deleteJobDescription,
  generateJobDescription,
  generateInterviewQuestions,
  getInterviewQuestions,
  deleteInterviewQuestion
};
