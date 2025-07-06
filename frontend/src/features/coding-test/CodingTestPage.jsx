import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Stack,
  CircularProgress,
  Grid,
  Chip,
  Button,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  PlayCircle as StartIcon,
  CheckCircle as CompletedIcon,
  HourglassEmpty as ProcessingIcon,
  Error as ErrorIcon,
  ArrowBack as BackIcon,
  Code as CodeIcon,
  PlayArrow as RunIcon,
  DoneAll as SubmitIcon,
  Timer as TimerIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import {
  startTestSession,
  submitCode,
  endTestSession,
  getFinalSessionEvaluation,
  logAntiCheatEvent,
} from './api/codingTestApi';
import CodeEditor from './components/CodeEditor';
import TestCaseResults from './components/TestCaseResults';
import AntiCheatMonitor from './components/AntiCheatMonitor';
import FuturisticBackground from '../../components/FuturisticBackground';
import GlowingCard from '../../components/GlowingCard';
import HolographicButton from '../../components/HolographicButton';

// Define the states of the coding test
const TEST_STATES = {
  IDLE: 'idle', // Before the test starts
  IN_PROGRESS: 'in_progress', // During the test
  COMPLETED: 'completed', // Immediately after finishing, waiting for evaluation
  EVALUATION: 'evaluation', // When final results are available
  ERROR: 'error', // If an unrecoverable error occurs
};

const CodingTestPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { sessionId } = useParams(); // Assuming the session ID is passed in the URL

  const [testState, setTestState] = useState(TEST_STATES.IDLE);
  const [sessionData, setSessionData] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [codeStates, setCodeStates] = useState({}); // Stores code and language for each challenge
  const [executionResult, setExecutionResult] = useState(null);
  const [finalEvaluation, setFinalEvaluation] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const currentChallenge = useMemo(() => challenges[currentChallengeIndex], [challenges, currentChallengeIndex]);
  const currentCodeState = useMemo(() => codeStates[currentChallenge?.id] || { code: '', language: '' }, [codeStates, currentChallenge]);

  // Countdown timer effect
  useEffect(() => {
    if (testState === TEST_STATES.IN_PROGRESS && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && testState === TEST_STATES.IN_PROGRESS) {
      handleEndTest();
    }
  }, [countdown, testState]);

  const handleStartTest = async () => {
    setIsLoading(true);
    try {
      // In a real app, sessionId would be pre-created and passed via URL
      // For this example, let's assume `startTestSession` initializes everything
      const response = await startTestSession(sessionId);
      setSessionData(response.session);
      setChallenges(response.challenges);
      
      const initialCodeStates = {};
      response.challenges.forEach(challenge => {
        const defaultLang = challenge.supported_languages[0];
        initialCodeStates[challenge.id] = {
          code: challenge.base_code_stubs[defaultLang] || '',
          language: defaultLang,
        };
      });
      setCodeStates(initialCodeStates);

      setCountdown(response.session.duration_minutes * 60);
      setTestState(TEST_STATES.IN_PROGRESS);
    } catch (err) {
      console.error("Failed to start test session:", err);
      setError("Could not start the test session. Please check the session ID and try again.");
      setTestState(TEST_STATES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCode = async () => {
    if (!currentChallenge) return;
    setIsSubmitting(true);
    setExecutionResult(null);
    try {
      const response = await submitCode({
        session_id: sessionId,
        challenge_id: currentChallenge.id,
        language: currentCodeState.language,
        code: currentCodeState.code,
      });
      setExecutionResult(response.execution_result);
      toast.success("Tests completed!");
    } catch (err) {
      console.error("Failed to run code:", err);
      toast.error("An error occurred while running your code.");
      setExecutionResult(err.response?.data?.detail || { stderr: "Failed to execute code." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollForEvaluation = useCallback(async () => {
    const maxAttempts = 15;
    const delay = 5000; // 5 seconds
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const result = await getFinalSessionEvaluation(sessionId);
        if (result && result.final_evaluation_summary !== "Evaluation in progress. Please check back later.") {
          setFinalEvaluation(result);
          setTestState(TEST_STATES.EVALUATION);
          return;
        }
      } catch (err) {
        console.error(`Polling attempt ${i + 1} failed:`, err);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    setError("Could not retrieve evaluation results in time. Please check back later.");
    setTestState(TEST_STATES.ERROR);
  }, [sessionId]);

  const handleEndTest = useCallback(async () => {
    setIsLoading(true);
    setTestState(TEST_STATES.COMPLETED);
    try {
      await endTestSession(sessionId);
      pollForEvaluation();
    } catch (err) {
      console.error("Failed to end test session:", err);
      setError("An error occurred while finalizing your test.");
      setTestState(TEST_STATES.ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, pollForEvaluation]);

  const handleCodeChange = (newCode) => {
    setCodeStates(prev => ({
      ...prev,
      [currentChallenge.id]: { ...prev[currentChallenge.id], code: newCode },
    }));
  };

  const handleLanguageChange = (newLanguage) => {
    setCodeStates(prev => ({
      ...prev,
      [currentChallenge.id]: {
        ...prev[currentChallenge.id],
        language: newLanguage,
        code: challenges.find(c => c.id === currentChallenge.id)?.base_code_stubs[newLanguage] || '',
      },
    }));
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const renderIdleState = () => (
    <GlowingCard color="primary" sx={{ p: 4, textAlign: 'center' }}>
      <Stack spacing={3} alignItems="center" maxWidth="md">
        <CodeIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>AI-Powered Coding Test</Typography>
        <Typography variant="h6" color="text.secondary">
          Welcome to your technical assessment. Please read the instructions carefully before you begin.
        </Typography>
        <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
          <List>
            <ListItem><ListItemIcon><InfoIcon color="info" /></ListItemIcon><ListItemText primary="You will have a set amount of time to complete all challenges." /></ListItem>
            <ListItem><ListItemIcon><InfoIcon color="info" /></ListItemIcon><ListItemText primary="Your code will be evaluated on correctness, efficiency, and style." /></ListItem>
            <ListItem><ListItemIcon><InfoIcon color="info" /></ListItemIcon><ListItemText primary="Switching tabs or pasting code is monitored to ensure test integrity." /></ListItem>
            <ListItem><ListItemIcon><InfoIcon color="info" /></ListItemIcon><ListItemText primary="Click 'Run Code' to test your solution against public test cases." /></ListItem>
          </List>
        </Paper>
        <HolographicButton
          onClick={handleStartTest}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={24} /> : <StartIcon />}
          color="success"
          sx={{ width: 250, height: 60, fontSize: '1.2rem', mt: 2 }}
        >
          {isLoading ? "Loading..." : "Start Test"}
        </HolographicButton>
      </Stack>
    </GlowingCard>
  );

  const renderInProgressState = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', p: 2, gap: 2 }}>
      <AntiCheatMonitor sessionId={sessionId} isActive={true} />
      {/* Header */}
      <Paper sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.light' }}>
          Coding Challenge
        </Typography>
        <Chip
          icon={<TimerIcon />}
          label={formatTime(countdown)}
          color={countdown < 300 ? 'error' : 'success'}
          sx={{ fontSize: '1.1rem', p: '12px', fontWeight: 'bold' }}
        />
      </Paper>
      {/* Main Content */}
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        {/* Left Panel: Challenge Description */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Tabs
              value={currentChallengeIndex}
              onChange={(e, newValue) => setCurrentChallengeIndex(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {challenges.map((challenge, index) => (
                <Tab key={challenge.id} label={`Challenge ${index + 1}`} />
              ))}
            </Tabs>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, mt: 1 }}>
              <Typography variant="h6" gutterBottom>{currentChallenge?.title}</Typography>
              <Chip label={currentChallenge?.difficulty} color="info" size="small" sx={{ mb: 2 }} />
              <Typography variant="body2" component="div" dangerouslySetInnerHTML={{ __html: currentChallenge?.description.replace(/\n/g, '<br />') }} />
            </Box>
          </Paper>
        </Grid>
        {/* Right Panel: Editor and Results */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Code Editor */}
          <Box sx={{ flex: 3, minHeight: '400px' }}>
            <CodeEditor
              language={currentCodeState.language}
              onLanguageChange={handleLanguageChange}
              code={currentCodeState.code}
              onCodeChange={handleCodeChange}
              supportedLanguages={currentChallenge?.supported_languages || []}
              onPaste={() => logAntiCheatEvent({ session_id: sessionId, event_type: 'paste' })}
            />
          </Box>
          {/* Results Panel */}
          <Box sx={{ flex: 2, minHeight: '300px' }}>
            <TestCaseResults executionResult={executionResult} isLoading={isSubmitting} />
          </Box>
        </Grid>
      </Grid>
      {/* Footer Actions */}
      <Paper sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <HolographicButton
            onClick={handleEndTest}
            color="error"
            startIcon={<SubmitIcon />}
        >
            Submit & End Test
        </HolographicButton>
        <HolographicButton
          onClick={handleRunCode}
          disabled={isSubmitting}
          color="success"
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <RunIcon />}
        >
          {isSubmitting ? 'Running...' : 'Run Code'}
        </HolographicButton>
      </Paper>
    </Box>
  );

  const renderCompletedState = (message, showProgress = true) => (
    <GlowingCard color="secondary" sx={{ p: 4, textAlign: 'center' }}>
      <Stack spacing={3} alignItems="center">
        {showProgress ? <ProcessingIcon sx={{ fontSize: 80, color: 'secondary.main' }} /> : <CompletedIcon sx={{ fontSize: 80, color: 'success.main' }} />}
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {message}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your code has been submitted. We are now performing a detailed AI-powered evaluation.
        </Typography>
        {showProgress && <CircularProgress color="secondary" sx={{ my: 2 }} />}
        <Typography variant="body2">
          This may take a few moments. Please wait...
        </Typography>
      </Stack>
    </GlowingCard>
  );

  const renderEvaluationState = () => (
    <GlowingCard color="success" sx={{ p: 4, width: '100%', maxWidth: 'lg' }}>
      <Stack spacing={3}>
        <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 'bold', textAlign: 'center' }}>
          Test Evaluation Complete
        </Typography>
        <Paper sx={{ p: 3, background: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">Overall Score</Typography>
              <Typography variant="h2" sx={{ color: 'success.light', fontWeight: 'bold' }}>
                {finalEvaluation.overall_score?.toFixed(1) || 'N/A'}%
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>AI Summary</Typography>
              <Typography variant="body1">{finalEvaluation.final_evaluation_summary}</Typography>
            </Grid>
          </Grid>
        </Paper>
        {finalEvaluation.plagiarism_concerns?.length > 0 && (
          <Paper sx={{ p: 2, background: alpha(theme.palette.warning.dark, 0.3) }}>
            <Typography variant="h6" color="warning.light">Integrity Flags</Typography>
            <List dense>
              {finalEvaluation.plagiarism_concerns.map((concern, i) => <ListItem key={i}><ListItemText primary={concern} /></ListItem>)}
            </List>
          </Paper>
        )}
        <Divider />
        <Typography variant="h5">Detailed Breakdown</Typography>
        {finalEvaluation.submissions?.map((sub, i) => (
          <Paper key={i} sx={{ p: 2, background: 'rgba(0,0,0,0.1)' }}>
            <Typography variant="h6">{sub.challenge_title}</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>Language: {sub.language} | Tests Passed: {sub.passed_tests}/{sub.total_tests}</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} md={3}><Chip label={`Correctness: ${sub.evaluation.correctness_score?.toFixed(0)}%`} color="primary" sx={{width: '100%'}} /></Grid>
              <Grid item xs={6} md={3}><Chip label={`Efficiency: ${sub.evaluation.efficiency_score?.toFixed(0)}%`} color="secondary" sx={{width: '100%'}} /></Grid>
              <Grid item xs={6} md={3}><Chip label={`Style: ${sub.evaluation.style_score?.toFixed(0)}%`} color="info" sx={{width: '100%'}} /></Grid>
              <Grid item xs={6} md={3}><Chip label={`Readability: ${sub.evaluation.readability_score?.toFixed(0)}%`} color="success" sx={{width: '100%'}} /></Grid>
            </Grid>
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}><strong>AI Feedback:</strong> {sub.evaluation.ai_feedback}</Typography>
          </Paper>
        ))}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <HolographicButton onClick={() => navigate('/dashboard')} color="primary">
            Return to Dashboard
          </HolographicButton>
        </Box>
      </Stack>
    </GlowingCard>
  );

  const renderErrorState = () => (
      <GlowingCard color="error" sx={{ p: 4, textAlign: 'center' }}>
          <Stack spacing={3} alignItems="center">
              <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>An Error Occurred</Typography>
              <Typography variant="body1" color="text.secondary">{error}</Typography>
              <HolographicButton onClick={() => navigate(-1)} startIcon={<BackIcon />}>Go Back</HolographicButton>
          </Stack>
      </GlowingCard>
  );

  const renderContent = () => {
    switch (testState) {
      case TEST_STATES.IDLE: return renderIdleState();
      case TEST_STATES.IN_PROGRESS: return renderInProgressState();
      case TEST_STATES.COMPLETED: return renderCompletedState("Test Finished", true);
      case TEST_STATES.EVALUATION: return renderEvaluationState();
      case TEST_STATES.ERROR: return renderErrorState();
      default: return <CircularProgress />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ minHeight: '100vh', position: 'relative' }}
    >
      <FuturisticBackground />
      <Container
        maxWidth={testState === TEST_STATES.IN_PROGRESS ? 'xl' : 'lg'}
        sx={{
          py: testState === TEST_STATES.IN_PROGRESS ? 0 : 4,
          px: testState === TEST_STATES.IN_PROGRESS ? '0 !important' : 2,
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        {renderContent()}
      </Container>
    </motion.div>
  );
};

export default CodingTestPage;
