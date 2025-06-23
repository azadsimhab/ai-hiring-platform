// frontend/src/App.js (Updated with File Upload UI and Logic)

import React, { useState } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, TextField, Button, Grid,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Divider
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material'; // Import an icon
import { styled } from '@mui/material/styles';

const API_BASE_URL = 'https://api-backend-tzgb3x3t4a-uc.a.run.app';

// Create a visually hidden input for the file upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});


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
    employment_type: 'Permanent',
    hiring_type: 'External',
    other_remarks: ''
  });

  const [status, setStatus] = useState({ message: '', error: false, loading: false });
  const [fileStatus, setFileStatus] = useState({ message: '', loading: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  // New handler for the file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileStatus({ message: `Uploading ${file.name}...`, loading: true });

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/hiring-requests/parse-document`, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the form state with the data parsed by the AI (or our mock)
      setFormData(response.data);
      setFileStatus({ message: 'Document parsed successfully! Please review and submit.', loading: false });

    } catch (error) {
      console.error('Error uploading file:', error);
      setFileStatus({ message: 'Error parsing document.', loading: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: 'Submitting...', error: false, loading: true });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/hiring-requests`, formData);
      setStatus({ message: `Success! Hiring Request created with ID: ${response.data.id}`, error: false, loading: false });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus({ message: 'Error: Could not submit the request.', error: true, loading: false });
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: 'white',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          New Hiring Request
        </Typography>

        {/* --- File Upload Section --- */}
        <Box sx={{ textAlign: 'center', my: 3 }}>
          <Button
            component="label"
            role={undefined}
            variant="outlined"
            tabIndex={-1}
            startIcon={fileStatus.loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            disabled={fileStatus.loading}
          >
            Upload Document to Parse
            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
          </Button>
          {fileStatus.message && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              {fileStatus.message}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }}>OR</Divider>

        {/* --- Manual Entry Form --- */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Job Title" name="job_title" value={formData.job_title} onChange={handleChange} required />
            </Grid>
            {/* ... other form fields remain the same ... */}
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
                <Typography color={status.error ? 'error' : 'green'} align="center" sx={{ fontWeight: '600' }}>
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