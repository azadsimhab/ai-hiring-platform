import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const MultimodalScreeningPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4, color: 'white' }}>
        Multimodal Screening
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
            Video & Audio Interviews
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Conduct AI-powered video and audio interviews with real-time analysis and sentiment detection.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MultimodalScreeningPage; 