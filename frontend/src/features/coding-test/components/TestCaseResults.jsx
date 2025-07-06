import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  alpha,
  useTheme,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  DataObject as DataObjectIcon,
  Error as ErrorIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CodeBlock - A styled component for displaying code snippets.
 */
const CodeBlock = ({ title, content, language = 'json' }) => {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
        {title}
      </Typography>
      <Paper
        component="pre"
        elevation={0}
        sx={{
          p: 1.5,
          background: alpha(theme.palette.common.black, 0.3),
          borderRadius: 1,
          color: theme.palette.text.primary,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          maxHeight: 150,
          overflowY: 'auto',
        }}
      >
        {typeof content === 'object' ? JSON.stringify(content, null, 2) : content}
      </Paper>
    </Box>
  );
};

/**
 * TestCaseResults - Displays the results of code execution and test cases.
 *
 * @param {Object} props
 * @param {object | null} props.executionResult - The result object from the backend.
 * @param {boolean} props.isLoading - True if code is currently being executed.
 */
const TestCaseResults = ({ executionResult, isLoading }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          p: 2,
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>
          Running tests...
        </Typography>
      </Box>
    );
  }

  if (!executionResult) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          p: 2,
        }}
      >
        <Typography color="text.secondary">
          Run your code to see the test results here.
        </Typography>
      </Box>
    );
  }

  const {
    passed_tests,
    total_tests,
    execution_time_ms,
    stdout,
    stderr,
    results,
  } = executionResult;

  const passPercentage = total_tests > 0 ? (passed_tests / total_tests) * 100 : 0;
  const progressColor =
    passPercentage === 100 ? 'success' : passPercentage > 50 ? 'info' : 'warning';

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10, 15, 24, 0.9)',
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.3),
      }}
    >
      {/* Summary Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Results
          </Typography>
          <Chip
            icon={<TimerIcon />}
            label={`${execution_time_ms?.toFixed(2) || 'N/A'} ms`}
            size="small"
            sx={{
              background: alpha(theme.palette.info.main, 0.2),
              color: theme.palette.info.light,
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LinearProgress
            variant="determinate"
            value={passPercentage}
            color={progressColor}
            sx={{
              flexGrow: 1,
              height: 10,
              borderRadius: 5,
              backgroundColor: alpha(theme.palette[progressColor].main, 0.2),
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
              },
            }}
          />
          <Typography
            variant="subtitle1"
            sx={{ color: `${progressColor}.main`, fontWeight: 'bold' }}
          >
            {passed_tests} / {total_tests} Passed
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'secondary.main',
              boxShadow: `0 0 10px ${alpha(theme.palette.secondary.main, 0.7)}`,
            },
          }}
        >
          <Tab icon={<CheckCircleIcon />} iconPosition="start" label="Test Cases" />
          <Tab icon={<DataObjectIcon />} iconPosition="start" label="Output" />
          {stderr && (
            <Tab
              icon={<ErrorIcon />}
              iconPosition="start"
              label="Error"
              sx={{ color: 'error.main' }}
            />
          )}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Test Cases Panel */}
            {activeTab === 0 && (
              <Box>
                {results.map((testCase, index) => (
                  <Accordion
                    key={index}
                    sx={{
                      mb: 1,
                      background: alpha(theme.palette.common.black, 0.2),
                      border: '1px solid',
                      borderColor: testCase.passed
                        ? alpha(theme.palette.success.main, 0.3)
                        : alpha(theme.palette.error.main, 0.3),
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {testCase.passed ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <CancelIcon color="error" />
                          )}
                          <Typography>Test Case #{testCase.test_case}</Typography>
                        </Box>
                        <Chip
                          label={testCase.passed ? 'Passed' : 'Failed'}
                          color={testCase.passed ? 'success' : 'error'}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{ background: alpha(theme.palette.common.black, 0.1) }}
                    >
                      <CodeBlock title="Input" content={testCase.input} />
                      <CodeBlock title="Expected Output" content={testCase.expected} />
                      <CodeBlock title="Actual Output" content={testCase.actual} />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}

            {/* Output Panel */}
            {activeTab === 1 && (
              <CodeBlock title="Standard Output (stdout)" content={stdout || 'No output.'} />
            )}

            {/* Error Panel */}
            {activeTab === 2 && stderr && (
              <CodeBlock title="Standard Error (stderr)" content={stderr} />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default TestCaseResults;
