import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  alpha,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  WorkspacePremium as CertificateIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

/**
 * Helper function to determine color based on score
 * @param {number} score - The score from 0 to 100
 * @returns {string} - MUI color name (e.g., 'success', 'warning')
 */
const getScoreColor = (score) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'error';
};

/**
 * Helper function to get ranking icon and color
 * @param {number} rank - The rank of the candidate (0-indexed)
 * @returns {Object} - Object containing icon and color
 */
const getRankIcon = (rank) => {
  switch (rank) {
    case 0:
      return { icon: <TrophyIcon />, color: '#FFD700', label: '1st Place' }; // Gold
    case 1:
      return { icon: <TrophyIcon />, color: '#C0C0C0', label: '2nd Place' }; // Silver
    case 2:
      return { icon: <TrophyIcon />, color: '#CD7F32', label: '3rd Place' }; // Bronze
    default:
      return { icon: <CertificateIcon />, color: '#64B5F6', label: `Rank ${rank + 1}` }; // Blue for others
  }
};

/**
 * CandidateCard - A single card representing a top candidate
 */
const CandidateCard = ({ candidate, rank, onSelect }) => {
  const theme = useTheme();
  const rankInfo = getRankIcon(rank);
  const scoreColor = getScoreColor(candidate.match_score);

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Paper
        elevation={3}
        onClick={() => onSelect(candidate.resume_id)}
        sx={{
          p: 3,
          height: '100%',
          background: 'rgba(15, 20, 25, 0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(rankInfo.color, 0.5),
          boxShadow: `0 0 20px ${alpha(rankInfo.color, 0.3)}`,
          transition: 'all 0.3s ease-in-out',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-5px) scale(1.02)',
            boxShadow: `0 10px 30px ${alpha(rankInfo.color, 0.5)}`,
            borderColor: alpha(rankInfo.color, 0.8),
          },
        }}
      >
        <Stack spacing={2.5}>
          {/* Header with Rank and Name */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title={rankInfo.label} placement="top">
              <Box sx={{ color: rankInfo.color, fontSize: '2.5rem' }}>
                {React.cloneElement(rankInfo.icon, { sx: { fontSize: 'inherit' } })}
              </Box>
            </Tooltip>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {candidate.candidate_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {candidate.experience_years ? `${candidate.experience_years} years experience` : 'Experience not specified'}
              </Typography>
            </Box>
          </Stack>

          {/* Overall Match Score */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="subtitle2" color="text.secondary">Overall Match</Typography>
              <Typography variant="h6" sx={{ color: `${scoreColor}.main`, fontWeight: 'bold' }}>
                {Math.round(candidate.match_score)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={candidate.match_score}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: alpha(theme.palette[scoreColor].main, 0.2),
                '& .MuiLinearProgress-bar': {
                  bgcolor: `${scoreColor}.main`,
                  borderRadius: 5,
                  boxShadow: `0 0 8px ${alpha(theme.palette[scoreColor].main, 0.7)}`,
                },
              }}
            />
          </Box>

          {/* Strengths and Weaknesses */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Strengths</Typography>
              <List dense sx={{ p: 0 }}>
                {candidate.strengths?.slice(0, 2).map((strength, index) => (
                  <ListItem key={index} sx={{ p: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28, color: 'success.main' }}>
                      <CheckIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={<Typography variant="body2">{strength}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Weaknesses</Typography>
              <List dense sx={{ p: 0 }}>
                {candidate.weaknesses?.slice(0, 2).map((weakness, index) => (
                  <ListItem key={index} sx={{ p: 0 }}>
                    <ListItemIcon sx={{ minWidth: 28, color: 'error.main' }}>
                      <CancelIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={<Typography variant="body2">{weakness}</Typography>} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>

          {/* Key Skills */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Key Skills</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {candidate.skills?.slice(0, 5).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                />
              ))}
            </Box>
          </Box>
        </Stack>
      </Paper>
    </Grid>
  );
};

/**
 * TopCandidates - A component to display the top candidates for a job
 * 
 * @param {Object} props
 * @param {Array<Object>} props.topCandidates - Array of top candidate objects
 * @param {boolean} props.isLoading - Loading state
 * @param {function} props.onSelectCandidate - Callback when a candidate is selected
 */
const TopCandidates = ({ topCandidates, isLoading, onSelectCandidate }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Analyzing Top Candidates...</Typography>
      </Box>
    );
  }

  if (!topCandidates || topCandidates.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, textAlign: 'center' }}>
        <TrendingUpIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>No Top Candidates Found</Typography>
        <Typography variant="body1" color="text.secondary">
          There are no evaluated candidates for this job description yet.
          <br />
          Upload and evaluate some resumes to see the top matches here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ color: 'secondary.main', fontWeight: 'bold', mb: 3 }}>
        Top Candidate Leaderboard
      </Typography>
      <Grid container spacing={3}>
        {topCandidates.map((candidate, index) => (
          <CandidateCard
            key={candidate.resume_id}
            candidate={candidate}
            rank={index}
            onSelect={onSelectCandidate}
          />
        ))}
      </Grid>
    </Box>
  );
};

export default TopCandidates;
