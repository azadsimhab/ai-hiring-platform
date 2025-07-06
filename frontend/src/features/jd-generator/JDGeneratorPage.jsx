import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  QuestionAnswer as QuestionIcon,
  AutoAwesome as AIIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';

import { 
  createJobDescription, 
  getJobDescription, 
  listJobDescriptions, 
  updateJobDescription, 
  generateJobDescription,
  generateInterviewQuestions,
  getInterviewQuestions,
  deleteInterviewQuestion
} from './api/jdGeneratorApi';
import { getHiringRequest } from '../hiring-requests/api/hiringRequestsApi';
import FuturisticBackground from '../../components/FuturisticBackground';
import GlowingCard from '../../components/GlowingCard';
import HolographicButton from '../../components/HolographicButton';
import { useAuth } from '../../hooks/useAuth';

// Define experience levels
const EXPERIENCE_LEVELS = ['Entry', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive'];

// Define job types
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship', 'Remote'];

// Define question types
const QUESTION_TYPES = ['behavioral', 'technical', 'situational'];

// Define difficulty levels
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

const JDGeneratorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: jobDescriptionId, hiringRequestId } = useParams();
  
  // State for job description list
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  
  // State for current job description
  const [currentJD, setCurrentJD] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for job description form
  const [formData, setFormData] = useState({
    job_title: '',
    department: '',
    experience_level: 'Mid',
    skills_required: [],
    job_type: 'Full-time',
    location: '',
    additional_context: '',
    hiring_request_id: hiringRequestId ? parseInt(hiringRequestId) : null,
  });
  
  // State for skills input
  const [skillInput, setSkillInput] = useState('');
  
  // State for interview questions
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({
    count: 5,
    question_types: ['behavioral', 'technical'],
    difficulty_level: 'medium',
  });
  
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);
  
  // State for hiring request data
  const [hiringRequest, setHiringRequest] = useState(null);
  const [isLoadingHiringRequest, setIsLoadingHiringRequest] = useState(false);
  
  // Load job descriptions
  const loadJobDescriptions = useCallback(async () => {
    try {
      setIsLoadingList(true);
      const params = {};
      if (hiringRequestId) {
        params.hiring_request_id = hiringRequestId;
      }
      const data = await listJobDescriptions(params);
      setJobDescriptions(data);
    } catch (error) {
      toast.error('Failed to load job descriptions');
      console.error(error);
    } finally {
      setIsLoadingList(false);
    }
  }, [hiringRequestId]);
  
  // Load hiring request data if hiringRequestId is provided
  useEffect(() => {
    const fetchHiringRequest = async () => {
      if (hiringRequestId) {
        try {
          setIsLoadingHiringRequest(true);
          const data = await getHiringRequest(hiringRequestId);
          setHiringRequest(data);
          
          // Pre-fill form with hiring request data
          setFormData(prevState => ({
            ...prevState,
            job_title: data.position_title || '',
            department: data.department || '',
            location: data.location || '',
            additional_context: `Hiring request notes: ${data.notes || ''}`,
          }));
        } catch (error) {
          toast.error('Failed to load hiring request data');
          console.error(error);
        } finally {
          setIsLoadingHiringRequest(false);
        }
      }
    };
    
    fetchHiringRequest();
  }, [hiringRequestId]);
  
  // Load job description if jobDescriptionId is provided
  useEffect(() => {
    const fetchJobDescription = async () => {
      if (jobDescriptionId) {
        try {
          setIsLoading(true);
          const data = await getJobDescription(jobDescriptionId);
          setCurrentJD(data);
          loadInterviewQuestions(jobDescriptionId);
          setActiveTab(1); // Switch to view tab
        } catch (error) {
          toast.error('Failed to load job description');
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchJobDescription();
  }, [jobDescriptionId]);
  
  // Load job descriptions on component mount
  useEffect(() => {
    loadJobDescriptions();
  }, [loadJobDescriptions]);
  
  // Load interview questions
  const loadInterviewQuestions = async (jdId) => {
    try {
      setIsLoadingQuestions(true);
      const data = await getInterviewQuestions(jdId);
      setQuestions(data);
    } catch (error) {
      toast.error('Failed to load interview questions');
      console.error(error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };
  
  // Handle skill input changes
  const handleSkillInputChange = (e) => {
    setSkillInput(e.target.value);
  };
  
  // Add skill to the list
  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData(prevState => ({
        ...prevState,
        skills_required: [...prevState.skills_required, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };
  
  // Remove skill from the list
  const handleRemoveSkill = (index) => {
    setFormData(prevState => ({
      ...prevState,
      skills_required: prevState.skills_required.filter((_, i) => i !== index),
    }));
  };
  
  // Handle question form input changes
  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target;
    setQuestionFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };
  
  // Handle question types selection
  const handleQuestionTypesChange = (e) => {
    setQuestionFormData(prevState => ({
      ...prevState,
      question_types: e.target.value,
    }));
  };
  
  // Generate job description
  const handleGenerateJD = async () => {
    try {
      if (!formData.job_title || !formData.department || formData.skills_required.length === 0) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      setIsLoading(true);
      const generatedJD = await generateJobDescription(formData);
      setCurrentJD(generatedJD);
      toast.success('Job description generated successfully');
      setActiveTab(1); // Switch to view tab
      await loadJobDescriptions(); // Refresh the list
    } catch (error) {
      toast.error('Failed to generate job description');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate interview questions
  const handleGenerateQuestions = async () => {
    if (!currentJD) return;
    
    try {
      setIsGeneratingQuestions(true);
      const generatedQuestions = await generateInterviewQuestions(
        currentJD.id,
        questionFormData
      );
      setQuestions(prevQuestions => [...prevQuestions, ...generatedQuestions]);
      toast.success('Interview questions generated successfully');
    } catch (error) {
      toast.error('Failed to generate interview questions');
      console.error(error);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };
  
  // Delete interview question
  const handleDeleteQuestion = async (questionId) => {
    if (!currentJD) return;
    
    try {
      await deleteInterviewQuestion(currentJD.id, questionId);
      setQuestions(prevQuestions => 
        prevQuestions.filter(question => question.id !== questionId)
      );
      toast.success('Question deleted successfully');
    } catch (error) {
      toast.error('Failed to delete question');
      console.error(error);
    }
  };
  
  // Enable editing mode
  const handleEdit = () => {
    if (!currentJD) return;
    
    setFormData({
      job_title: currentJD.title,
      department: '',
      experience_level: 'Mid',
      skills_required: currentJD.required_qualifications,
      job_type: 'Full-time',
      location: '',
      additional_context: '',
      hiring_request_id: currentJD.hiring_request_id,
    });
    setIsEditing(true);
    setActiveTab(0); // Switch to form tab
  };
  
  // Save edited job description
  const handleSave = async () => {
    if (!currentJD) return;
    
    try {
      setIsSaving(true);
      const updatedJD = await updateJobDescription(currentJD.id, {
        title: formData.job_title,
        overview: currentJD.overview,
        responsibilities: currentJD.responsibilities,
        required_qualifications: formData.skills_required,
        preferred_qualifications: currentJD.preferred_qualifications,
        benefits: currentJD.benefits,
        equal_opportunity_statement: currentJD.equal_opportunity_statement,
      });
      setCurrentJD(updatedJD);
      setIsEditing(false);
      toast.success('Job description updated successfully');
      setActiveTab(1); // Switch to view tab
    } catch (error) {
      toast.error('Failed to update job description');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Select a job description from the list
  const handleSelectJD = (jd) => {
    navigate(`/job-descriptions/${jd.id}`);
  };
  
  // Go back to hiring request
  const handleBackToHiringRequest = () => {
    if (hiringRequestId) {
      navigate(`/hiring-requests/${hiringRequestId}`);
    } else {
      navigate('/hiring-requests');
    }
  };
  
  // Create a new job description form
  const handleCreateNew = () => {
    setCurrentJD(null);
    setFormData({
      job_title: '',
      department: '',
      experience_level: 'Mid',
      skills_required: [],
      job_type: 'Full-time',
      location: '',
      additional_context: '',
      hiring_request_id: hiringRequestId ? parseInt(hiringRequestId) : null,
    });
    setIsEditing(false);
    setActiveTab(0); // Switch to form tab
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', position: 'relative' }}
    >
      <FuturisticBackground />
      
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton 
            color="primary" 
            onClick={handleBackToHiringRequest}
            sx={{ 
              background: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': { background: 'rgba(0, 0, 0, 0.4)' }
            }}
          >
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ 
            color: 'primary.main',
            fontWeight: 'bold',
            textShadow: '0 0 10px rgba(0, 100, 255, 0.5)'
          }}>
            Job Description Generator
          </Typography>
          {hiringRequest && (
            <Chip 
              label={`Hiring Request: ${hiringRequest.position_title}`}
              color="secondary"
              sx={{ ml: 2, boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)' }}
            />
          )}
        </Stack>
        
        <Grid container spacing={4}>
          {/* Left sidebar - Job Descriptions List */}
          <Grid item xs={12} md={3}>
            <GlowingCard color="primary" sx={{ height: '100%' }}>
              <Box sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Job Descriptions</Typography>
                  <HolographicButton
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={handleCreateNew}
                  >
                    New
                  </HolographicButton>
                </Stack>
                
                <Divider sx={{ mb: 2 }} />
                
                {isLoadingList ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : jobDescriptions.length > 0 ? (
                  <List sx={{ maxHeight: '600px', overflow: 'auto' }}>
                    {jobDescriptions.map((jd) => (
                      <Paper
                        key={jd.id}
                        elevation={3}
                        sx={{
                          mb: 2,
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: 'rgba(0, 0, 0, 0.2)',
                          backdropFilter: 'blur(10px)',
                          border: jd.id === (currentJD?.id || -1) ? '1px solid' : 'none',
                          borderColor: 'primary.main',
                          boxShadow: jd.id === (currentJD?.id || -1) 
                            ? '0 0 15px rgba(0, 100, 255, 0.5)' 
                            : 'none',
                          '&:hover': {
                            background: 'rgba(0, 0, 0, 0.4)',
                          }
                        }}
                        onClick={() => handleSelectJD(jd)}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {jd.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Created: {new Date(jd.created_at).toLocaleDateString()}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={jd.status} 
                          color={jd.status === 'published' ? 'success' : 'default'}
                          sx={{ mr: 1 }}
                        />
                        {jd.ai_generated && (
                          <Chip 
                            size="small" 
                            icon={<AIIcon />} 
                            label="AI Generated" 
                            color="secondary"
                          />
                        )}
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No job descriptions found
                  </Typography>
                )}
              </Box>
            </GlowingCard>
          </Grid>
          
          {/* Main content area */}
          <Grid item xs={12} md={9}>
            <GlowingCard color="secondary" sx={{ height: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-selected': {
                        color: 'secondary.main',
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'secondary.main',
                      height: 3,
                      borderRadius: 1.5,
                      boxShadow: '0 0 10px rgba(156, 39, 176, 0.8)'
                    }
                  }}
                >
                  <Tab label="Generate" icon={<AIIcon />} iconPosition="start" />
                  {currentJD && <Tab label="View & Edit" icon={<EditIcon />} iconPosition="start" />}
                  {currentJD && <Tab label="Interview Questions" icon={<QuestionIcon />} iconPosition="start" />}
                </Tabs>
              </Box>
              
              {/* Generate Tab */}
              <Box role="tabpanel" hidden={activeTab !== 0} sx={{ p: 3 }}>
                {activeTab === 0 && (
                  <Stack spacing={3}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {isEditing ? 'Edit Job Description' : 'Generate New Job Description'}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Job Title"
                          name="job_title"
                          value={formData.job_title}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          InputProps={{
                            sx: {
                              background: 'rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                          variant="outlined"
                          InputProps={{
                            sx: {
                              background: 'rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="experience-level-label">Experience Level</InputLabel>
                          <Select
                            labelId="experience-level-label"
                            name="experience_level"
                            value={formData.experience_level}
                            onChange={handleInputChange}
                            label="Experience Level"
                            sx={{
                              background: 'rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            {EXPERIENCE_LEVELS.map((level) => (
                              <MenuItem key={level} value={level}>{level}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="job-type-label">Job Type</InputLabel>
                          <Select
                            labelId="job-type-label"
                            name="job_type"
                            value={formData.job_type}
                            onChange={handleInputChange}
                            label="Job Type"
                            sx={{
                              background: 'rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            {JOB_TYPES.map((type) => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          variant="outlined"
                          InputProps={{
                            sx: {
                              background: 'rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <TextField
                            fullWidth
                            label="Add Required Skills"
                            value={skillInput}
                            onChange={handleSkillInputChange}
                            variant="outlined"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                            InputProps={{
                              sx: {
                                background: 'rgba(0, 0, 0, 0.2)',
                                backdropFilter: 'blur(10px)',
                              }
                            }}
                          />
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddSkill}
                            startIcon={<AddIcon />}
                          >
                            Add
                          </Button>
                        </Stack>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {formData.skills_required.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              onDelete={() => handleRemoveSkill(index)}
                              color="primary"
                              variant="outlined"
                              sx={{ 
                                borderColor: 'primary.main',
                                '& .MuiChip-deleteIcon': {
                                  color: 'primary.main',
                                }
                              }}
                            />
                          ))}
                        </Box>
                        <FormHelperText>
                          Add at least 3 required skills for better results
                        </FormHelperText>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Additional Context"
                          name="additional_context"
                          value={formData.additional_context}
                          onChange={handleInputChange}
                          multiline
                          rows={4}
                          variant="outlined"
                          helperText="Add any additional information that might help the AI generate a better job description"
                          InputProps={{
                            sx: {
                              background: 'rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                      {isEditing ? (
                        <HolographicButton
                          onClick={handleSave}
                          disabled={isSaving}
                          startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                          color="success"
                        >
                          Save Changes
                        </HolographicButton>
                      ) : (
                        <HolographicButton
                          onClick={handleGenerateJD}
                          disabled={isLoading}
                          startIcon={isLoading ? <CircularProgress size={20} /> : <AIIcon />}
                          color="secondary"
                        >
                          Generate Job Description
                        </HolographicButton>
                      )}
                    </Box>
                  </Stack>
                )}
              </Box>
              
              {/* View & Edit Tab */}
              <Box role="tabpanel" hidden={activeTab !== 1} sx={{ p: 3 }}>
                {activeTab === 1 && currentJD ? (
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h5" sx={{ 
                        color: 'secondary.main',
                        fontWeight: 'bold',
                        textShadow: '0 0 10px rgba(156, 39, 176, 0.5)'
                      }}>
                        {currentJD.title}
                      </Typography>
                      <HolographicButton
                        onClick={handleEdit}
                        startIcon={<EditIcon />}
                        color="info"
                      >
                        Edit
                      </HolographicButton>
                    </Box>
                    
                    <Divider />
                    
                    <Paper sx={{ 
                      p: 3, 
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                    }}>
                      <Typography variant="h6" gutterBottom>Overview</Typography>
                      <Typography paragraph>{currentJD.overview}</Typography>
                      
                      <Typography variant="h6" gutterBottom>Responsibilities</Typography>
                      <List>
                        {currentJD.responsibilities.map((item, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                      
                      <Typography variant="h6" gutterBottom>Required Qualifications</Typography>
                      <List>
                        {currentJD.required_qualifications.map((item, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                      
                      <Typography variant="h6" gutterBottom>Preferred Qualifications</Typography>
                      <List>
                        {currentJD.preferred_qualifications.map((item, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                      
                      <Typography variant="h6" gutterBottom>Benefits</Typography>
                      <List>
                        {currentJD.benefits.map((item, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                      
                      {currentJD.equal_opportunity_statement && (
                        <>
                          <Typography variant="h6" gutterBottom>Equal Opportunity Statement</Typography>
                          <Typography paragraph>{currentJD.equal_opportunity_statement}</Typography>
                        </>
                      )}
                    </Paper>
                  </Stack>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <Typography variant="body1" color="text.secondary">
                      No job description selected. Generate one first.
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Interview Questions Tab */}
              <Box role="tabpanel" hidden={activeTab !== 2} sx={{ p: 3 }}>
                {activeTab === 2 && currentJD ? (
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Interview Questions</Typography>
                      <HolographicButton
                        onClick={handleGenerateQuestions}
                        disabled={isGeneratingQuestions}
                        startIcon={isGeneratingQuestions ? <CircularProgress size={20} /> : <AIIcon />}
                        color="secondary"
                      >
                        Generate Questions
                      </HolographicButton>
                    </Box>
                    
                    <Paper sx={{ 
                      p: 3, 
                      mb: 3,
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                    }}>
                      <Typography variant="subtitle1" gutterBottom>Question Generation Settings</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Number of Questions"
                            name="count"
                            type="number"
                            value={questionFormData.count}
                            onChange={handleQuestionFormChange}
                            InputProps={{
                              inputProps: { min: 1, max: 20 },
                              sx: {
                                background: 'rgba(0, 0, 0, 0.2)',
                                backdropFilter: 'blur(10px)',
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel id="question-types-label">Question Types</InputLabel>
                            <Select
                              labelId="question-types-label"
                              multiple
                              name="question_types"
                              value={questionFormData.question_types}
                              onChange={handleQuestionTypesChange}
                              label="Question Types"
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                  ))}
                                </Box>
                              )}
                              sx={{
                                background: 'rgba(0, 0, 0, 0.2)',
                                backdropFilter: 'blur(10px)',
                              }}
                            >
                              {QUESTION_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth>
                            <InputLabel id="difficulty-level-label">Difficulty Level</InputLabel>
                            <Select
                              labelId="difficulty-level-label"
                              name="difficulty_level"
                              value={questionFormData.difficulty_level}
                              onChange={handleQuestionFormChange}
                              label="Difficulty Level"
                              sx={{
                                background: 'rgba(0, 0, 0, 0.2)',
                                backdropFilter: 'blur(10px)',
                              }}
                            >
                              {DIFFICULTY_LEVELS.map((level) => (
                                <MenuItem key={level} value={level}>{level}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Paper>
                    
                    <Divider />
                    
                    {isLoadingQuestions ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={30} />
                      </Box>
                    ) : questions.length > 0 ? (
                      <Stack spacing={2}>
                        {questions.map((question) => (
                          <Paper
                            key={question.id}
                            elevation={3}
                            sx={{
                              p: 3,
                              background: 'rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor: 
                                question.type === 'behavioral' ? 'info.main' :
                                question.type === 'technical' ? 'warning.main' : 'success.main',
                              boxShadow: 
                                question.type === 'behavioral' ? '0 0 10px rgba(3, 169, 244, 0.3)' :
                                question.type === 'technical' ? '0 0 10px rgba(255, 152, 0, 0.3)' : 
                                '0 0 10px rgba(76, 175, 80, 0.3)',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Stack direction="row" spacing={1}>
                                <Chip 
                                  label={question.type} 
                                  color={
                                    question.type === 'behavioral' ? 'info' :
                                    question.type === 'technical' ? 'warning' : 'success'
                                  }
                                  size="small"
                                />
                                <Chip 
                                  label={question.difficulty} 
                                  color={
                                    question.difficulty === 'easy' ? 'success' :
                                    question.difficulty === 'medium' ? 'warning' : 'error'
                                  }
                                  size="small"
                                />
                              </Stack>
                              <IconButton 
                                color="error" 
                                size="small"
                                onClick={() => handleDeleteQuestion(question.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                            
                            <Typography variant="h6" gutterBottom>
                              {question.question}
                            </Typography>
                            
                            {question.purpose && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                <strong>Purpose:</strong> {question.purpose}
                              </Typography>
                            )}
                            
                            {question.ideal_answer_points.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Ideal Answer Should Include:
                                </Typography>
                                <List dense>
                                  {question.ideal_answer_points.map((point, index) => (
                                    <ListItem key={index} sx={{ py: 0.5 }}>
                                      <ListItemText primary={point} />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <Typography variant="body1" color="text.secondary">
                          No interview questions generated yet. Click the "Generate Questions" button to create some.
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <Typography variant="body1" color="text.secondary">
                      No job description selected. Generate one first.
                    </Typography>
                  </Box>
                )}
              </Box>
            </GlowingCard>
          </Grid>
        </Grid>
      </Container>
    </motion.div>
  );
};

export default JDGeneratorPage;
