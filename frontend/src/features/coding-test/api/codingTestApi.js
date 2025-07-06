import axios from 'axios';
import { API_BASE_URL } from '../../../config/constants';

const CODING_TEST_API_URL = `${API_BASE_URL}/coding-tests`;

/**
 * Generates a new coding challenge using AI.
 * @param {object} requestData - The data for generating the challenge.
 * @param {number} requestData.job_description_id - The ID of the associated job description.
 * @param {string} requestData.difficulty - The desired difficulty ('easy', 'medium', 'hard').
 * @param {string} requestData.language - The primary language for the challenge.
 * @param {string} [requestData.topic] - An optional specific topic.
 * @returns {Promise<object>} The newly generated coding challenge.
 */
export const generateChallengeWithAi = async (requestData) => {
  try {
    const response = await axios.post(`${CODING_TEST_API_URL}/challenges/generate`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error generating AI coding challenge:', error);
    throw error;
  }
};

/**
 * Lists all available coding challenges with optional filters.
 * @param {object} [params] - Optional query parameters.
 * @param {string} [params.difficulty] - Filter by difficulty.
 * @param {number} [params.job_description_id] - Filter by job description ID.
 * @returns {Promise<Array<object>>} A list of coding challenges.
 */
export const listChallenges = async (params = {}) => {
  try {
    const response = await axios.get(`${CODING_TEST_API_URL}/challenges`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching coding challenges:', error);
    throw error;
  }
};

/**
 * Creates a new coding test session for a candidate.
 * @param {object} requestData - The data to create the session.
 * @param {number} requestData.candidate_profile_id - The ID of the candidate.
 * @param {number} requestData.job_description_id - The ID of the job description.
 * @param {Array<number>} requestData.challenge_ids - A list of challenge IDs for the test.
 * @param {number} requestData.duration_minutes - The duration of the test in minutes.
 * @returns {Promise<object>} The created test session object.
 */
export const createTestSession = async (requestData) => {
  try {
    const response = await axios.post(`${CODING_TEST_API_URL}/sessions/create`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating coding test session:', error);
    throw error;
  }
};

/**
 * Starts a coding test session.
 * @param {number} sessionId - The ID of the test session to start.
 * @returns {Promise<object>} An object containing the session details and the challenges.
 */
export const startTestSession = async (sessionId) => {
  try {
    const response = await axios.post(`${CODING_TEST_API_URL}/sessions/${sessionId}/start`);
    return response.data;
  } catch (error) {
    console.error(`Error starting test session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Submits a candidate's code for a specific challenge.
 * @param {object} requestData - The submission data.
 * @param {number} requestData.session_id - The ID of the current test session.
 * @param {number} requestData.challenge_id - The ID of the challenge being submitted.
 * @param {string} requestData.language - The language of the code.
 * @param {string} requestData.code - The candidate's code.
 * @returns {Promise<object>} The result of the submission, including execution results.
 */
export const submitCode = async (requestData) => {
  try {
    const response = await axios.post(`${CODING_TEST_API_URL}/submissions`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error submitting code:', error);
    throw error;
  }
};

/**
 * Logs an anti-cheating event for a session.
 * @param {object} requestData - The event data.
 * @param {number} requestData.session_id - The ID of the test session.
 * @param {string} requestData.event_type - The type of event ('focus_change', 'paste').
 * @returns {Promise<void>}
 */
export const logAntiCheatEvent = async (requestData) => {
  try {
    await axios.post(`${CODING_TEST_API_URL}/sessions/events`, requestData);
  } catch (error) {
    // Fail silently on the UI to avoid disrupting the user.
    console.warn('Could not log anti-cheat event:', error);
  }
};

/**
 * Ends a coding test session and triggers final evaluation.
 * @param {number} sessionId - The ID of the test session to end.
 * @returns {Promise<object>} A preliminary response indicating the session is being evaluated.
 */
export const endTestSession = async (sessionId) => {
  try {
    const response = await axios.post(`${CODING_TEST_API_URL}/sessions/${sessionId}/end`);
    return response.data;
  } catch (error) {
    console.error(`Error ending test session ${sessionId}:`, error);
    throw error;
  }
};

/**
 * Fetches the final evaluation summary for a completed test session.
 * @param {number} sessionId - The ID of the test session.
 * @returns {Promise<object>} The final evaluation data or a status message.
 */
export const getFinalSessionEvaluation = async (sessionId) => {
  try {
    const response = await axios.get(`${CODING_TEST_API_URL}/sessions/${sessionId}/evaluation`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching final evaluation for session ${sessionId}:`, error);
    throw error;
  }
};

export default {
  generateChallengeWithAi,
  listChallenges,
  createTestSession,
  startTestSession,
  submitCode,
  logAntiCheatEvent,
  endTestSession,
  getFinalSessionEvaluation,
};
