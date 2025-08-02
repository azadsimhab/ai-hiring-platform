import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      }}
    >
      <Typography variant="h1" sx={{ color: '#667eea', mb: 2, fontWeight: 'bold' }}>
        404
      </Typography>
      <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4 }}>
        The page you're looking for doesn't exist.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/dashboard')}
        sx={{
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          '&:hover': {
            background: 'linear-gradient(45deg, #764ba2, #667eea)',
          },
        }}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage; 