import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Chip, LinearProgress, alpha, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Psychology as BehavioralIcon, Code as TechnicalIcon, HelpOutline as SituationalIcon } from '@mui/icons-material';

/**
 * Helper to get styling based on question type
 * @param {string} type - The type of the question (e.g., 'behavioral')
 * @param {object} theme - The MUI theme object
 * @returns {object} - Object containing icon and color
 */
const getQuestionTypeStyle = (type, theme) => {
  const lowerType = type.toLowerCase();
  switch (lowerType) {
    case 'behavioral':
      return {
        icon: <BehavioralIcon />,
        color: 'info',
        shadow: `0 0 15px ${alpha(theme.palette.info.main, 0.6)}`,
      };
    case 'technical':
      return {
        icon: <TechnicalIcon />,
        color: 'warning',
        shadow: `0 0 15px ${alpha(theme.palette.warning.main, 0.6)}`,
      };
    case 'situational':
      return {
        icon: <SituationalIcon />,
        color: 'success',
        shadow: `0 0 15px ${alpha(theme.palette.success.main, 0.6)}`,
      };
    default:
      return {
        icon: <HelpOutlineIcon />,
        color: 'primary',
        shadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.6)}`,
      };
  }
};

/**
 * InterviewQuestion - A component to display the current interview question and a preparation countdown.
 *
 * @param {Object} props
 * @param {object} props.question - The question object containing text, type, and order.
 * @param {number} [props.prepTime=30] - The preparation time in seconds.
 * @param {function(): void} props.onCountdownEnd - Callback function when the preparation timer ends.
 */
const InterviewQuestion = ({ question, prepTime = 30, onCountdownEnd }) => {
  const theme = useTheme();
  const [countdown, setCountdown] = useState(prepTime);

  // Memoize question style to prevent recalculation on every render
  const questionStyle = useMemo(
    () => getQuestionTypeStyle(question?.question_type || 'general', theme),
    [question, theme]
  );

  // Countdown timer logic
  useEffect(() => {
    // Reset countdown when a new question is passed
    setCountdown(prepTime);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onCountdownEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup interval on component unmount or when question changes
    return () => clearInterval(timer);
  }, [question, prepTime, onCountdownEnd]);

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = (countdown / prepTime) * 100;

  return (
    <Box
      sx={{
        p: 4,
        background: 'rgba(10, 15, 24, 0.7)',
        backdropFilter: 'blur(15px)',
        border: '1px solid',
        borderColor: alpha(theme.palette[questionStyle.color].main, 0.4),
        borderRadius: 4,
        boxShadow: `0 0 25px ${alpha(theme.palette[questionStyle.color].main, 0.3)}`,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        minHeight: 350,
        width: '100%',
        maxWidth: '800px',
        mx: 'auto',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ width: '100%' }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Chip
              icon={questionStyle.icon}
              label={question.question_type}
              color={questionStyle.color}
              sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 1,
                p: '12px 20px',
                boxShadow: questionStyle.shadow,
              }}
            />

            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 'bold',
                color: 'common.white',
                textShadow: `0 0 10px ${alpha(theme.palette.common.white, 0.5)}`,
                lineHeight: 1.4,
              }}
            >
              {question.question_text}
            </Typography>
          </Box>
        </motion.div>
      </AnimatePresence>

      <Box sx={{ width: '100%', mt: 3 }}>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
          Prepare your answer...
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              flexGrow: 1,
              height: 10,
              borderRadius: 5,
              backgroundColor: alpha(theme.palette[questionStyle.color].main, 0.2),
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                backgroundColor: theme.palette[questionStyle.color].main,
                transition: 'transform .2s linear',
              },
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: theme.palette[questionStyle.color].main,
              fontWeight: 'bold',
              minWidth: '70px',
              textAlign: 'right',
            }}
          >
            {formatTime(countdown)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default InterviewQuestion;
