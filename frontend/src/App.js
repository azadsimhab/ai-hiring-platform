// frontend/src/App.js (Refactored with Material-UI)

import React, { useState } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, TextField, Button, Grid,
  Select, MenuItem, FormControl, InputLabel, CircularProgress
} from '@mui/material';

// IMPORTANT: Use your actual backend URL
const API_BASE_URL = 'https://api-backend-tzgb3x3t4a-uc.a.run.app';

function App() {
  const [formData, setFormData] = useState({
    job_title: '',
    department: '',
    manager: '',
    level: '',
    salary_range: '',
    benefits_perks: '',
    locations: '',
    urgency: 'Medium',
    other_remarks: '',
    employment_type: 'Permanent',
    hiring_type: 'External'
  });

  const [status, setStatus] = useState({ message: '', error: false, loading: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: 'Submitting...', error: false, loading: true });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/hiring-requests`, formData);
      setStatus({ message: `Success! Hiring Request created with ID: ${response.data.id}`, error: false, loading: false });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus({ message: 'Error: Could not submit the request. Please check the console.', error: true, loading: false });
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: 'white',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          New Hiring Request
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Job Title" name="job_title" value={formData.job_title} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Department" name="department" value={formData.department} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Hiring Manager" name="manager" value={formData.manager} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Level (e.g., L5)" name="level" value={formData.level} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Salary Range" name="salary_range" value={formData.salary_range} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Locations" name="locations" value={formData.locations} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Benefits & Perks" name="benefits_perks" value={formData.benefits_perks} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Urgency</InputLabel>
                <Select name="urgency" value={formData.urgency} label="Urgency" onChange={handleChange}>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select name="employment_type" value={formData.employment_type} label="Employment Type" onChange={handleChange}>
                  <MenuItem value="Permanent">Permanent</MenuItem>
                  <MenuItem value="Temporary">Temporary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Hiring Type</InputLabel>
                <Select name="hiring_type" value={formData.hiring_type} label="Hiring Type" onChange={handleChange}>
                  <MenuItem value="External">External</MenuItem>
                  <MenuItem value="Internal">Internal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Other Remarks" name="other_remarks" value={formData.other_remarks} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" size="large" fullWidth disabled={status.loading}>
                {status.loading ? <CircularProgress size={24} /> : 'Create Request'}
              </Button>
            </Grid>
            {status.message && (
              <Grid item xs={12}>
                <Typography color={status.error ? 'error' : 'green'} align="center">
                  {status.message}
                </Typography>
              </Grid>
            )}
          </Grid>
        </form>
      </Box>
    </Container>
  );
}

export default App;