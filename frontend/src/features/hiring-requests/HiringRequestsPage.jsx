import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const HiringRequestsPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4, color: 'white' }}>
        Hiring Requests
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
            Manage Hiring Requests
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            This feature allows you to create, manage, and track hiring requests with AI-powered candidate matching.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HiringRequestsPage; 