import React, { useState } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, TextField, Button, Grid,
  Select, MenuItem, FormControl, InputLabel, CircularProgress, Divider,
  Tabs, Tab
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// NOTE: We are keeping the BackgroundPaths component for our overall page background
import { BackgroundPaths } from './BackgroundPaths';

const API_BASE_URL = 'https://api-backend-tzgb3x3t4a-uc.a.run.app';

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

// A helper component to manage the content of each tab
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// --- React Component for the Hiring Request Form ---
// We've moved the form into its own component for better organization
function HiringRequestForm() {
  const [formData, setFormData] = useState({
    job_title: '', department: '', manager: '', level: '', salary_range: '',
    benefits_perks: '', locations: '', urgency: 'Medium', employment_type: 'Permanent',
    hiring_type: 'External', other_remarks: ''
  });

  const [status, setStatus] = useState({ message: '', error: false, loading: false });
  const [fileStatus, setFileStatus] = useState({ message: '', loading: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileStatus({ message: `Uploading ${file.name}...`, loading: true });
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/hiring-requests/parse-document`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
    <>
      <Typography variant="h5" component="h2" gutterBottom>
        Submit New Hiring Request
      </Typography>
      <Box sx={{ textAlign: 'center', my: 3, p: 2, border: '1px dashed grey', borderRadius: 2 }}>
        <Button
          component="label"
          role={undefined}
          variant="outlined"
          tabIndex={-1}
          startIcon={fileStatus.loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={fileStatus.loading}
        >
          Upload Document to Auto-Fill Form
          <VisuallyHiddenInput type="file" onChange={handleFileChange} />
        </Button>
        {fileStatus.message && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {fileStatus.message}
          </Typography>
        )}
      </Box>
      <Divider sx={{ my: 2 }}>OR FILL MANUALLY</Divider>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Job Title" name="job_title" value={formData.job_title} onChange={handleChange} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Department" name="department" value={formData.department} onChange={handleChange} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Hiring Manager" name="manager" value={formData.manager} onChange={handleChange} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Level (e.g., L5)" name="level" value={formData.level} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Salary Range" name="salary_range" value={formData.salary_range} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Locations" name="locations" value={formData.locations} onChange={handleChange} /></Grid>
          <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Benefits & Perks" name="benefits_perks" value={formData.benefits_perks} onChange={handleChange} /></Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth><InputLabel>Urgency</InputLabel><Select name="urgency" value={formData.urgency} label="Urgency" onChange={handleChange}><MenuItem value="Low">Low</MenuItem><MenuItem value="Medium">Medium</MenuItem><MenuItem value="High">High</MenuItem></Select></FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth><InputLabel>Employment Type</InputLabel><Select name="employment_type" value={formData.employment_type} label="Employment Type" onChange={handleChange}><MenuItem value="Permanent">Permanent</MenuItem><MenuItem value="Temporary">Temporary</MenuItem></Select></FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth><InputLabel>Hiring Type</InputLabel><Select name="hiring_type" value={formData.hiring_type} label="Hiring Type" onChange={handleChange}><MenuItem value="External">External</MenuItem><MenuItem value="Internal">Internal</MenuItem></Select></FormControl>
          </Grid>
          <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Other Remarks" name="other_remarks" value={formData.other_remarks} onChange={handleChange} /></Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" size="large" fullWidth disabled={status.loading}>
              {status.loading ? <CircularProgress size={24} /> : 'Create Request'}
            </Button>
          </Grid>
          {status.message && (<Grid item xs={12}><Typography color={status.error ? 'error' : 'green'} align="center" sx={{ fontWeight: '600' }}>{status.message}</Typography></Grid>)}
        </Grid>
      </form>
    </>
  );
}

// --- Main App Component with Tabs ---
function App() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <BackgroundPaths />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, mt: 4, mb: 4 }}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
            AI Hiring Platform
          </Typography>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(5px)', borderRadius: '8px 8px 0 0' }}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="hiring workflow tabs" centered>
              <Tab label="1. New Hiring Request" />
              <Tab label="2. Job Description Generator" />
              <Tab label="3. Resume Scanner" />
              <Tab label="4. Interview Prep" />
              {/* Add more tabs here as we build features */}
            </Tabs>
          </Box>
          <Box sx={{ boxShadow: 3, borderRadius: '0 0 8px 8px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
            <CustomTabPanel value={currentTab} index={0}>
              <HiringRequestForm />
            </CustomTabPanel>
            <CustomTabPanel value={currentTab} index={1}>
              <Typography variant="h5">Job Description Generator</Typography>
              <Typography>This section is under construction. We will build this next!</Typography>
            </CustomTabPanel>
            <CustomTabPanel value={currentTab} index={2}>
               <Typography variant="h5">Resume Scanner</Typography>
               <Typography>This section is under construction.</Typography>
            </CustomTabPanel>
             <CustomTabPanel value={currentTab} index={3}>
               <Typography variant="h5">Interview Prep</Typography>
               <Typography>This section is under construction.</Typography>
            </CustomTabPanel>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default App;