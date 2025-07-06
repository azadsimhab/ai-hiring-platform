import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Box,
  Typography,
  Container,
  Stack,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  PlayCircle as StartIcon,
  CheckCircle as CompletedIcon,
  HourglassEmpty as ProcessingIcon,
  Error as ErrorIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Work as WorkIcon,
} from '@mui/icons-material';

import {
  startInterviewSession,
  submitCandidateResponse,
  endInterviewSession,
  getFinalEvaluation,
  getInterviewSessionDetails,
  listSessionsForCandidate,
} from './api/screeningApi';
import { getCandidateProfile } from '../resume-scanner/api/resumeScannerApi';
import { getJobDescription } from '../jd-generator/api/jdGeneratorApi';

import FuturisticBackground from '../../components/FuturisticBackground';
import GlowingCard from '../../components/GlowingCard';
import HolographicButton from '../../components/HolographicButton';
import InterviewQuestion from './components/InterviewQuestion';
import VideoRecorder from './components/VideoRecorder';
// Assuming an AudioRecorder component exists with a similar API to VideoRecorder
// import AudioRecorder from './components/AudioRecorder';

// Define interview states
const INTERVIEW_STATES = {
  IDLE: 'idle',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  EVALUATION: 'evaluation',
  ERROR: 'error',
};

const MultimodalScreeningPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { candidateId, jobDescriptionId } = useParams();

  const [interviewState, setInterviewState] = useState(INTERVIEW_STATES.IDLE);
  const [sessionData, setSessionData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [prepCountdownEnded, setPrepCountdownEnded] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  
  const [candidate, setCandidate] = useState(null);
  const [jobDescription, setJobDescription] = useState(null);
  const [pastSessions, setPastSessions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data (candidate, job description, past sessions)
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [candidateData, jobDescData, pastSessionsData] = await Promise.all([
          getCandidateProfile(candidateId),
          getJobDescription(jobDescriptionId),
          listSessionsForCandidate(candidateId),
        ]);
        setCandidate(candidateData);
        setJobDescription(jobDescData);
        setPastSessions(pastSessionsData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load necessary data. Please check the candidate and job description IDs.');
        setInterviewState(INTERVIEW_STATES.ERROR);
      } finally {
        setIsLoading(false);
      }
    };

    if (candidateId && jobDescriptionId) {
      loadInitialData();
    }
  }, [candidateId, jobDescriptionId]);

  // Handler to start the interview
  const handleStartInterview = async () => {
    setIsLoading(true);
    try {
      const response = await startInterviewSession({
        candidate_profile_id: candidateId,
        job_description_id: jobDescriptionId,
      });
      setSessionData({ sessionId: response.interview_session_id });
      // Assuming the API might return the full list of questions or total count
      // For now, let's set the first question.
      setCurrentQuestion(response.first_question);
      setTotalQuestions(response.total_questions || 5); // Fallback to 5 if not provided
      setQuestionIndex(0);
      setInterviewState(INTERVIEW_STATES.IN_PROGRESS);
      setPrepCountdownEnded(false);
    } catch (err) {
      console.error('Failed to start interview:', err);
      toast.error('Could not start the interview session.');
      setError('An error occurred while trying to start the interview.');
      setInterviewState(INTERVIEW_STATES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  // Callback when preparation countdown ends
  const handlePrepCountdownEnd = useCallback(() => {
    setPrepCountdownEnded(true);
    setIsRecording(true);
  }, []);

  // Handler for when recording stops
  const handleStopRecording = useCallback(async (blob) => {
    setIsRecording(false);
    setIsSubmitting(true);
    try {
      const response = await submitCandidateResponse(
        sessionData.sessionId,
        currentQuestion.id,
        blob
      );

      if (response.interview_completed) {
        await endInterviewSession(sessionData.sessionId);
        setInterviewState(INTERVIEW_STATES.COMPLETED);
        pollForEvaluation(sessionData.sessionId);
      } else {
        setCurrentQuestion(response.next_question);
        setQuestionIndex(prev => prev + 1);
        setPrepCountdownEnded(false);
      }
    } catch (err) {
      console.error('Failed to submit response:', err);
      toast.error('Failed to submit your response.');
      setError('An error occurred while submitting your response.');
      setInterviewState(INTERVIEW_STATES.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionData, currentQuestion]);

  // Polling function to get the final evaluation
  const pollForEvaluation = useCallback(async (sessionId) => {
    const maxAttempts = 10;
    const delay = 5000; // 5 seconds

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const result = await getFinalEvaluation(sessionId);
        if (result && result.overall_score !== undefined) {
          setEvaluationData(result);
          setInterviewState(INTERVIEW_STATES.EVALUATION);
          return;
        }
      } catch (err) {
        console.error(`Polling attempt ${i + 1} failed:`, err);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    toast.error('Could not retrieve evaluation results.');
    setError('The evaluation is taking longer than expected. Please check back later.');
    setInterviewState(INTERVIEW_STATES.ERROR);
  }, []);

  const renderIdleState = () => (
    <GlowingCard color="primary" sx={{ p: 4 }}>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Multimodal Screening
        </Typography>
        
        <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.2)', width: '100%', borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <PersonIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Candidate</Typography>
                  <Typography>{candidate?.name}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center">
                <WorkIcon color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6">Position</Typography>
                  <Typography>{jobDescription?.title}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
        
        <HolographicButton
          onClick={handleStartInterview}
          startIcon={<StartIcon />}
          color="success"
          glowIntensity={0.9}
          sx={{ width: 250, height: 60, fontSize: '1.2rem' }}
        >
          Start Interview
        </HolographicButton>

        <Divider sx={{ width: '80%', my: 2 }} />

        <Typography variant="h6">Past Sessions</Typography>
        {pastSessions.length > 0 ? (
          <List sx={{ width: '100%' }}>
            {pastSessions.map(session => (
              <ListItem key={session.id} secondaryAction={
                <Chip label={session.status} color={session.status === 'completed' ? 'success' : 'default'} />
              }>
                <ListItemText
                  primary={`Session #${session.id}`}
                  secondary={`Conducted on: ${new Date(session.created_at).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">No past interview sessions found for this candidate.</Typography>
        )}
      </Stack>
    </GlowingCard>
  );

  const renderInProgressState = () => (
    <Stack spacing={4} alignItems="center" sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ color: 'secondary.main' }}>
        Question {questionIndex + 1} of {totalQuestions}
      </Typography>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <InterviewQuestion
            question={currentQuestion}
            onCountdownEnd={handlePrepCountdownEnd}
          />
        </motion.div>
      </AnimatePresence>

      <VideoRecorder
        isRecordingActive={isRecording}
        onStop={handleStopRecording}
        onRecordingStart={() => console.log('Recording started')}
      />

      {isSubmitting && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <CircularProgress size={24} />
          <Typography>Submitting your response...</Typography>
        </Box>
      )}
    </Stack>
  );

  const renderCompletedState = () => (
    <GlowingCard color="success" sx={{ p: 4, textAlign: 'center' }}>
      <Stack spacing={3} alignItems="center">
        <CompletedIcon sx={{ fontSize: 80, color: 'success.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Interview Completed!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Thank you for your time. We are now processing your responses.
        </Typography>
        <CircularProgress color="success" sx={{ my: 2 }} />
        <Typography variant="body2">
          This may take a few moments. Please wait...
        </Typography>
      </Stack>
    </GlowingCard>
  );

  const renderEvaluationState = () => (
    <GlowingCard color="secondary" sx={{ p: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" sx={{ color: 'secondary.main', fontWeight: 'bold', textAlign: 'center' }}>
          Interview Evaluation
        </Typography>
        <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Overall Summary</Typography>
          <Typography variant="body1">{evaluationData.summary}</Typography>
        </Paper>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Key Strengths</Typography>
              <List>
                {evaluationData.key_strengths.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>Areas for Improvement</Typography>
              <List>
                {evaluationData.areas_for_improvement.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </GlowingCard>
  );

  const renderErrorState = () => (
    <GlowingCard color="error" sx={{ p: 4, textAlign: 'center' }}>
      <Stack spacing={3} alignItems="center">
        <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          An Error Occurred
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error}
        </Typography>
        <HolographicButton onClick={() => navigate(-1)} startIcon={<BackIcon />}>
          Go Back
        </HolographicButton>
      </Stack>
    </GlowingCard>
  );

  const renderContent = () => {
    if (isLoading) {
      return <CircularProgress size={60} />;
    }

    switch (interviewState) {
      case INTERVIEW_STATES.IDLE:
        return renderIdleState();
      case INTERVIEW_STATES.IN_PROGRESS:
        return renderInProgressState();
      case INTERVIEW_STATES.COMPLETED:
        return renderCompletedState();
      case INTERVIEW_STATES.EVALUATION:
        return renderEvaluationState();
      case INTERVIEW_STATES.ERROR:
        return renderErrorState();
      default:
        return <Typography>Invalid State</Typography>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', position: 'relative' }}
    >
      <FuturisticBackground />
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 128px)' }}>
        {renderContent()}
      </Container>
    </motion.div>
  );
};

export default MultimodalScreeningPage;
