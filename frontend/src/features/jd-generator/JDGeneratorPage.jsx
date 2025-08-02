import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const JDGeneratorPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4, color: 'white' }}>
        Job Description Generator
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
            AI-Powered JD Creation
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Generate comprehensive job descriptions using AI based on role requirements and company culture.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default JDGeneratorPage; 