import axios from 'axios';
import { API_BASE_URL } from '../../../config/constants';

const RESUMES_API_URL = `${API_BASE_URL}/resumes`;

/**
 * Upload a resume file
 * @param {File} file - The resume file to upload
 * @param {number} [jobDescriptionId] - Optional job description ID to associate with the resume
 * @returns {Promise<Object>} - The uploaded resume data
 */
export const uploadResume = async (file, jobDescriptionId = null) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (jobDescriptionId) {
      formData.append('job_description_id', jobDescriptionId);
    }
    
    const response = await axios.post(`${RESUMES_API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

/**
 * Parse a resume that has already been uploaded
 * @param {number} resumeId - The ID of the resume to parse
 * @returns {Promise<Object>} - Status message
 */
export const parseResume = async (resumeId) => {
  try {
    const response = await axios.post(`${RESUMES_API_URL}/parse`, {
      resume_id: resumeId,
    });
    return response.data;
  } catch (error) {
    console.error(`Error parsing resume with ID ${resumeId}:`, error);
    throw error;
  }
};

/**
 * Evaluate a resume against a job description
 * @param {number} resumeId - The ID of the resume to evaluate
 * @param {number} jobDescriptionId - The ID of the job description to evaluate against
 * @returns {Promise<Object>} - Status message
 */
export const evaluateResume = async (resumeId, jobDescriptionId) => {
  try {
    const response = await axios.post(`${RESUMES_API_URL}/evaluate`, {
      resume_id: resumeId,
      job_description_id: jobDescriptionId,
    });
    return response.data;
  } catch (error) {
    console.error(`Error evaluating resume ${resumeId} against job description ${jobDescriptionId}:`, error);
    throw error;
  }
};

/**
 * Batch evaluate multiple resumes against a job description
 * @param {number} jobDescriptionId - The ID of the job description to evaluate against
 * @param {Array<number>} resumeIds - Array of resume IDs to evaluate
 * @returns {Promise<Object>} - Status message
 */
export const batchEvaluateResumes = async (jobDescriptionId, resumeIds) => {
  try {
    const response = await axios.post(`${RESUMES_API_URL}/batch-evaluate`, {
      job_description_id: jobDescriptionId,
      resume_ids: resumeIds,
    });
    return response.data;
  } catch (error) {
    console.error(`Error batch evaluating resumes against job description ${jobDescriptionId}:`, error);
    throw error;
  }
};

/**
 * Get a list of resumes with optional filtering
 * @param {Object} params - Query parameters
 * @param {number} [params.job_description_id] - Filter by job description ID
 * @param {string} [params.processing_status] - Filter by processing status
 * @param {number} [params.skip] - Number of records to skip
 * @param {number} [params.limit] - Maximum number of records to return
 * @returns {Promise<Array>} - List of resumes
 */
export const listResumes = async (params = {}) => {
  try {
    const response = await axios.get(RESUMES_API_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching resumes:', error);
    throw error;
  }
};

/**
 * Get a specific resume by ID
 * @param {number} resumeId - The resume ID
 * @returns {Promise<Object>} - The resume data
 */
export const getResume = async (resumeId) => {
  try {
    const response = await axios.get(`${RESUMES_API_URL}/${resumeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching resume with ID ${resumeId}:`, error);
    throw error;
  }
};

/**
 * Delete a resume
 * @param {number} resumeId - The resume ID
 * @returns {Promise<void>}
 */
export const deleteResume = async (resumeId) => {
  try {
    await axios.delete(`${RESUMES_API_URL}/${resumeId}`);
  } catch (error) {
    console.error(`Error deleting resume with ID ${resumeId}:`, error);
    throw error;
  }
};

/**
 * Get a temporary download URL for a resume file
 * @param {number} resumeId - The resume ID
 * @returns {Promise<Object>} - Object containing the download URL
 */
export const getResumeDownloadUrl = async (resumeId) => {
  try {
    const response = await axios.get(`${RESUMES_API_URL}/${resumeId}/download-url`);
    return response.data;
  } catch (error) {
    console.error(`Error getting download URL for resume ${resumeId}:`, error);
    throw error;
  }
};

/**
 * Get the candidate profile for a resume
 * @param {number} resumeId - The resume ID
 * @returns {Promise<Object>} - The candidate profile data
 */
export const getCandidateProfile = async (resumeId) => {
  try {
    const response = await axios.get(`${RESUMES_API_URL}/${resumeId}/profile`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching candidate profile for resume ${resumeId}:`, error);
    throw error;
  }
};

/**
 * Update a candidate profile
 * @param {number} resumeId - The resume ID
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<Object>} - The updated candidate profile
 */
export const updateCandidateProfile = async (resumeId, profileData) => {
  try {
    const response = await axios.put(`${RESUMES_API_URL}/${resumeId}/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error(`Error updating candidate profile for resume ${resumeId}:`, error);
    throw error;
  }
};

/**
 * Get all evaluations for a resume
 * @param {number} resumeId - The resume ID
 * @returns {Promise<Array>} - List of evaluations
 */
export const getResumeEvaluations = async (resumeId) => {
  try {
    const response = await axios.get(`${RESUMES_API_URL}/${resumeId}/evaluations`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching evaluations for resume ${resumeId}:`, error);
    throw error;
  }
};

/**
 * Get a specific evaluation for a resume against a job description
 * @param {number} resumeId - The resume ID
 * @param {number} jobDescriptionId - The job description ID
 * @returns {Promise<Object>} - The evaluation data
 */
export const getSpecificEvaluation = async (resumeId, jobDescriptionId) => {
  try {
    const response = await axios.get(`${RESUMES_API_URL}/${resumeId}/evaluations/${jobDescriptionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching evaluation for resume ${resumeId} and job description ${jobDescriptionId}:`, error);
    throw error;
  }
};

/**
 * Update a resume evaluation
 * @param {number} resumeId - The resume ID
 * @param {number} jobDescriptionId - The job description ID
 * @param {Object} evaluationData - The evaluation data to update
 * @returns {Promise<Object>} - The updated evaluation
 */
export const updateEvaluation = async (resumeId, jobDescriptionId, evaluationData) => {
  try {
    const response = await axios.put(
      `${RESUMES_API_URL}/${resumeId}/evaluations/${jobDescriptionId}`, 
      evaluationData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating evaluation for resume ${resumeId} and job description ${jobDescriptionId}:`, error);
    throw error;
  }
};

/**
 * Get skill evaluations for a candidate
 * @param {number} resumeId - The resume ID
 * @param {number} [jobDescriptionId] - Optional job description ID to filter by
 * @returns {Promise<Array>} - List of skill evaluations
 */
export const getSkillEvaluations = async (resumeId, jobDescriptionId = null) => {
  try {
    const params = jobDescriptionId ? { job_description_id: jobDescriptionId } : {};
    const response = await axios.get(`${RESUMES_API_URL}/${resumeId}/skill-evaluations`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching skill evaluations for resume ${resumeId}:`, error);
    throw error;
  }
};

/**
 * Search for resumes based on various criteria
 * @param {Object} searchParams - Search parameters
 * @param {number} [searchParams.job_description_id] - Filter by job description ID
 * @param {number} [searchParams.min_match_score] - Minimum match score
 * @param {string} [searchParams.status] - Filter by status
 * @param {Array<string>} [searchParams.skills] - Filter by skills
 * @param {number} [searchParams.experience_years_min] - Minimum years of experience
 * @param {number} [searchParams.limit] - Maximum number of results
 * @param {number} [searchParams.offset] - Number of results to skip
 * @returns {Promise<Array>} - Search results
 */
export const searchResumes = async (searchParams) => {
  try {
    const response = await axios.post(`${RESUMES_API_URL}/search`, searchParams);
    return response.data;
  } catch (error) {
    console.error('Error searching resumes:', error);
    throw error;
  }
};

/**
 * Get top candidates for a job description based on match score
 * @param {number} jobDescriptionId - The job description ID
 * @param {number} [limit=10] - Maximum number of candidates to return
 * @returns {Promise<Array>} - List of top candidates
 */
export const getTopCandidates = async (jobDescriptionId, limit = 10) => {
  try {
    const response = await axios.get(
      `${RESUMES_API_URL}/job-description/${jobDescriptionId}/top-candidates`,
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching top candidates for job description ${jobDescriptionId}:`, error);
    throw error;
  }
};

/**
 * Compare multiple candidates for a job description
 * @param {number} jobDescriptionId - The job description ID
 * @param {Array<number>} resumeIds - Array of resume IDs to compare
 * @returns {Promise<Object>} - Comparison data
 */
export const compareCandidates = async (jobDescriptionId, resumeIds) => {
  try {
    const response = await axios.get(
      `${RESUMES_API_URL}/job-description/${jobDescriptionId}/comparison`,
      { params: { resume_ids: resumeIds } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error comparing candidates for job description ${jobDescriptionId}:`, error);
    throw error;
  }
};

export default {
  uploadResume,
  parseResume,
  evaluateResume,
  batchEvaluateResumes,
  listResumes,
  getResume,
  deleteResume,
  getResumeDownloadUrl,
  getCandidateProfile,
  updateCandidateProfile,
  getResumeEvaluations,
  getSpecificEvaluation,
  updateEvaluation,
  getSkillEvaluations,
  searchResumes,
  getTopCandidates,
  compareCandidates
};
