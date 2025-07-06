import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Legend,
} from 'recharts';
import {
  Box,
  Typography,
  useTheme,
  alpha,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Radar as RadarIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';

/**
 * CustomTooltip - A futuristic tooltip for charts
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 2,
          background: 'rgba(10, 15, 24, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: 2,
          boxShadow: '0 0 15px rgba(0, 100, 255, 0.5)',
        }}
      >
        <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          {label}
        </Typography>
        {payload.map((p, index) => (
          <Typography key={index} variant="body2" sx={{ color: p.color }}>
            {`${p.name}: ${p.value}%`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

/**
 * SkillMatchGraph - A component to visualize skill matches
 * 
 * @param {Object} props
 * @param {Array<Object>} props.skillEvaluations - Array of skill evaluation objects
 *   e.g., [{ skill_name: 'Python', skill_score: 85 }]
 * @param {string} [props.defaultType='radar'] - Default chart type ('radar' or 'bar')
 */
const SkillMatchGraph = ({ skillEvaluations, defaultType = 'radar' }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState(defaultType);

  // Memoize processed data to prevent recalculations on re-render
  const chartData = useMemo(() => {
    if (!skillEvaluations || skillEvaluations.length === 0) {
      return [];
    }
    return skillEvaluations.map(skill => ({
      subject: skill.skill_name,
      candidateScore: Math.round(skill.skill_score),
      fullMark: 100,
    }));
  }, [skillEvaluations]);

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  if (chartData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Typography variant="body1" color="text.secondary">
          No skill evaluation data available to display.
        </Typography>
      </Box>
    );
  }

  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <PolarGrid stroke={alpha(theme.palette.primary.main, 0.2)} />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={{ fill: 'transparent' }} 
          axisLine={{ stroke: 'transparent' }}
        />
        <Radar 
          name="Candidate Score" 
          dataKey="candidateScore" 
          stroke={theme.palette.primary.main} 
          fill="url(#radarFill)"
          fillOpacity={0.6} 
          strokeWidth={2}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          iconType="circle"
          wrapperStyle={{ color: theme.palette.text.primary, paddingTop: 20 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <defs>
          <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={alpha(theme.palette.primary.main, 0.3)}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.primary.main, 0.1)} />
        <XAxis 
          dataKey="subject" 
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
          angle={-25}
          textAnchor="end"
          height={60}
          interval={0}
        />
        <YAxis 
          domain={[0, 100]} 
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} 
          label={{ value: 'Score %', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }} />
        <Legend 
          iconType="square"
          wrapperStyle={{ color: theme.palette.text.primary }}
        />
        <Bar 
          name="Candidate Score"
          dataKey="candidateScore" 
          fill="url(#barFill)" 
          radius={[4, 4, 0, 0]}
          background={{ fill: alpha(theme.palette.primary.light, 0.05) }}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          aria-label="chart type"
          size="small"
          sx={{
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(5px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            '& .MuiToggleButton-root': {
              color: theme.palette.text.secondary,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
            },
          }}
        >
          <ToggleButton value="radar" aria-label="radar chart">
            <RadarIcon />
            <Typography variant="caption" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>Radar</Typography>
          </ToggleButton>
          <ToggleButton value="bar" aria-label="bar chart">
            <BarChartIcon />
            <Typography variant="caption" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>Bar</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {chartType === 'radar' ? renderRadarChart() : renderBarChart()}
    </Box>
  );
};

export default SkillMatchGraph;
