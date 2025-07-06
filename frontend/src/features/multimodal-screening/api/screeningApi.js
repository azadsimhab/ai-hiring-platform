import axios from 'axios';
import { API_BASE_URL } from '../../../config/constants';

const SCREENING_API_URL = `${API_BASE_URL}/screening`;

/**
 * Starts a new interview session.
 * @param {object} requestData - The data to start the interview.
 * @param {number} requestData.candidate_profile_id - The ID of the candidate.
 * @param {number} requestData.job_description_id - The ID of the job description.
 * @param {string} [requestData.session_type='ai_only'] - The type of session.
 * @param {number} [requestData.num_questions=5] - Number of questions to generate.
 * @param {Array<string>} [requestData.question_types=['behavioral', 'technical']] - Types of questions.
 * @returns {Promise<object>} The initial interview session data, including the first question.
 */
export const startInterviewSession = async (requestData) => {
  try {
    const response = await axios.post(`${SCREENING_API_URL}/start`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error starting interview session:', error);
    throw error;
  }
};

/**
 * Submits a candidate's response to a screening question.
 * @param {number} sessionId - The ID of the interview session.
 * @param {number} screeningQuestionId - The ID of the question being answered.
 * @param {Blob} audioBlob - The recorded audio response as a Blob.
 * @param {string} [fileName='response.webm'] - The name of the audio file.
 * @returns {Promise<object>} The response, which may include the next question.
 */
export const submitCandidateResponse = async (sessionId, screeningQuestionId, audioBlob, fileName = 'response.webm') => {
  try {
    const formData = new FormData();
    formData.append('screening_question_id', screeningQuestionId);
    formData.append('audio_file', audioBlob, fileName);

    const response = await axios.post(`${SCREENING_API_URL}/${sessionId}/responses`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error submitting response for session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Ends an interview session.
 * @param {number} sessionId - The ID of the interview session to end.
 * @returns {Promise<object>} A confirmation message and the final status.
 */
export const endInterviewSession = async (sessionId) => {
  try {
    const response = await axios.post(`${SCREENING_API_URL}/${sessionId}/end`);
    return response.data;
  } catch (error) {
    console.error(`Error ending interview session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Retrieves the full details of an interview session.
 * @param {number} sessionId - The ID of the interview session.
 * @returns {Promise<object>} The detailed interview session data.
 */
export const getInterviewSessionDetails = async (sessionId) => {
  try {
    const response = await axios.get(`${SCREENING_API_URL}/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for interview session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Fetches the final AI-generated evaluation summary for a completed interview.
 * @param {number} sessionId - The ID of the interview session.
 * @returns {Promise<object>} The evaluation summary or a status message.
 */
export const getFinalEvaluation = async (sessionId) => {
  try {
    const response = await axios.get(`${SCREENING_API_URL}/${sessionId}/evaluation`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching final evaluation for session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Updates an interview session (e.g., adds human notes).
 * @param {number} sessionId - The ID of the interview session.
 * @param {object} updateData - The data to update.
 * @param {string} [updateData.status] - The new status.
 * @param {string} [updateData.human_notes] - Notes from a human reviewer.
 * @returns {Promise<object>} The updated interview session data.
 */
export const updateInterviewSession = async (sessionId, updateData) => {
  try {
    const response = await axios.put(`${SCREENING_API_URL}/${sessionId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating interview session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Lists all interview sessions for a specific candidate.
 * @param {number} candidateId - The ID of the candidate.
 * @returns {Promise<Array<object>>} A list of interview sessions.
 */
export const listSessionsForCandidate = async (candidateId) => {
  try {
    const response = await axios.get(`${SCREENING_API_URL}/candidate/${candidateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sessions for candidate ${candidateId}:`, error);
    throw error;
  }
};

export default {
  startInterviewSession,
  submitCandidateResponse,
  endInterviewSession,
  getInterviewSessionDetails,
  getFinalEvaluation,
  updateInterviewSession,
  listSessionsForCandidate,
};
