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
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Build as BuildIcon,
} from '@mui/icons-material';

// Helper to get score color
const getScoreColor = (score) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'error';
};

/**
 * ScoreProgressBar - A styled linear progress bar for displaying scores
 */
const ScoreProgressBar = ({ label, score }) => {
  const theme = useTheme();
  const color = getScoreColor(score);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" sx={{ color: `${color}.main`, fontWeight: 'bold' }}>
          {Math.round(score)}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(theme.palette[color].main, 0.2),
          '& .MuiLinearProgress-bar': {
            bgcolor: `${color}.main`,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};

/**
 * CandidateColumn - Renders a single candidate's comparison data
 */
const CandidateColumn = ({ candidate, requiredSkills, isTopScore }) => {
  const theme = useTheme();
  const matchedSkills = new Set(
    candidate.skills.filter(skill =>
      requiredSkills.some(reqSkill => skill.toLowerCase().includes(reqSkill.toLowerCase()))
    )
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '1px solid',
        borderColor: isTopScore ? 'secondary.main' : alpha(theme.palette.primary.main, 0.2),
        boxShadow: isTopScore ? '0 0 20px rgba(156, 39, 176, 0.5)' : 'none',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {candidate.candidate_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {candidate.experience_years ? `${candidate.experience_years} years experience` : 'Experience not specified'}
          </Typography>
        </Box>

        {/* Overall Score */}
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Overall Match
          </Typography>
          <ScoreProgressBar score={candidate.match_scores.overall} />
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.2) }} />

        {/* Score Breakdown */}
        <Stack spacing={2}>
          <ScoreProgressBar label="Experience" score={candidate.match_scores.experience} />
          <ScoreProgressBar label="Education" score={candidate.match_scores.education} />
          <ScoreProgressBar label="Skills" score={candidate.match_scores.skills} />
        </Stack>

        <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.2) }} />

        {/* Strengths & Weaknesses */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>Strengths</Typography>
          <List dense sx={{ p: 0 }}>
            {candidate.strengths?.slice(0, 3).map((strength, index) => (
              <ListItem key={index} sx={{ p: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckCircleIcon fontSize="small" color="success" />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="body2">{strength}</Typography>} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box>
          <Typography variant="subtitle2" gutterBottom>Weaknesses</Typography>
          <List dense sx={{ p: 0 }}>
            {candidate.weaknesses?.slice(0, 3).map((weakness, index) => (
              <ListItem key={index} sx={{ p: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CancelIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primary={<Typography variant="body2">{weakness}</Typography>} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.2) }} />

        {/* Skills Match */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>Skills Match</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {candidate.skills?.slice(0, 10).map((skill, index) => (
              <Tooltip key={index} title={matchedSkills.has(skill) ? 'Matches requirement' : 'Additional skill'}>
                <Chip
                  label={skill}
                  size="small"
                  color={matchedSkills.has(skill) ? 'success' : 'primary'}
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

/**
 * SkillHeatmap - A table showing skill coverage across candidates
 */
const SkillHeatmap = ({ candidates, requiredSkills }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.2),
        overflowX: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom>Skill Coverage Heatmap</Typography>
      <Box sx={{ minWidth: 600 }}>
        <Grid container sx={{ borderBottom: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.3) }}>
          <Grid item xs={4}>
            <Typography variant="subtitle2" sx={{ p: 1 }}>Required Skill</Typography>
          </Grid>
          {candidates.map(candidate => (
            <Grid item xs key={candidate.resume_id} sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" sx={{ p: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {candidate.candidate_name}
              </Typography>
            </Grid>
          ))}
        </Grid>
        {requiredSkills.map(skill => (
          <Grid
            container
            key={skill}
            sx={{
              borderBottom: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <Grid item xs={4}>
              <Typography variant="body2" sx={{ p: 1 }}>{skill}</Typography>
            </Grid>
            {candidates.map(candidate => {
              const hasSkill = candidate.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()));
              return (
                <Grid item xs key={candidate.resume_id} sx={{ textAlign: 'center', p: 1 }}>
                  {hasSkill && <CheckCircleIcon fontSize="small" color="success" />}
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
    </Paper>
  );
};

/**
 * CandidateComparison - Main component to compare candidates
 * 
 * @param {Object} props
 * @param {Object} props.comparisonData - Data object for comparison
 * @param {boolean} props.isLoading - Loading state
 */
const CandidateComparison = ({ comparisonData, isLoading }) => {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!comparisonData || !comparisonData.candidates || comparisonData.candidates.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Typography variant="body1" color="text.secondary">
          No candidates selected for comparison.
        </Typography>
      </Box>
    );
  }

  const { job_description, candidates, comparison_metrics } = comparisonData;
  const topScore = comparison_metrics.highest_match_score;

  return (
    <Stack spacing={4}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
          Candidate Comparison for "{job_description.title}"
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comparing {candidates.length} candidates based on AI-powered evaluation.
        </Typography>
      </Box>

      {/* Comparison Grid */}
      <Grid container spacing={3} alignItems="stretch">
        {candidates.map(candidate => (
          <Grid item xs={12} md={6} lg={12 / candidates.length} key={candidate.resume_id}>
            <CandidateColumn
              candidate={candidate}
              requiredSkills={job_description.required_qualifications}
              isTopScore={candidate.match_scores.overall === topScore}
            />
          </Grid>
        ))}
      </Grid>

      {/* Skill Heatmap */}
      <SkillHeatmap
        candidates={candidates}
        requiredSkills={job_description.required_qualifications}
      />
    </Stack>
  );
};

export default CandidateComparison;
