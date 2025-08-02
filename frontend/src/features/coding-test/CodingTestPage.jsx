import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const CodingTestPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4, color: 'white' }}>
        Coding Tests
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
            AI-Powered Coding Assessments
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Create and manage coding tests with real-time anti-cheat monitoring and AI-powered evaluation.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CodingTestPage; 