import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const ResumeScannerPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4, color: 'white' }}>
        Resume Scanner
      </Typography>
      
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            AI-Powered Resume Analysis
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Upload resumes and get instant AI analysis of candidate skills, experience, and fit for your positions.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResumeScannerPage; 