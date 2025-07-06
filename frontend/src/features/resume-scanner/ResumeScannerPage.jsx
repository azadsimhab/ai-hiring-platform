import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  FormControl,
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
  Avatar,
  Tooltip,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  Compare as CompareIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ArrowBack as BackIcon,
  AutoAwesome as AIIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

import { 
  uploadResume,
  parseResume,
  evaluateResume,
  batchEvaluateResumes,
  listResumes,
  getResume,
  deleteResume,
  getResumeDownloadUrl,
  getCandidateProfile,
  updateCandidateProfile,
  getResumeEvaluations,
  getSpecificEvaluation,
  getSkillEvaluations,
  searchResumes,
  getTopCandidates,
  compareCandidates
} from './api/resumeScannerApi';
import { getJobDescription, listJobDescriptions } from '../jd-generator/api/jdGeneratorApi';
import FuturisticBackground from '../../components/FuturisticBackground';
import GlowingCard from '../../components/GlowingCard';
import HolographicButton from '../../components/HolographicButton';
import { useAuth } from '../../hooks/useAuth';

// Define status colors
const STATUS_COLORS = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'error',
  shortlisted: 'success',
  rejected: 'error',
  reviewed: 'info'
};

// Define score color ranges
const getScoreColor = (score) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'error';
};

// Skill level mapping
const SKILL_LEVELS = {
  beginner: { label: 'Beginner', value: 25 },
  intermediate: { label: 'Intermediate', value: 50 },
  advanced: { label: 'Advanced', value: 75 },
  expert: { label: 'Expert', value: 100 }
};

const ResumeScannerPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobDescriptionId, resumeId } = useParams();
  const fileInputRef = useRef(null);
  
  // State for tabs
  const [activeTab, setActiveTab] = useState(0);
  
  // State for resumes
  const [resumes, setResumes] = useState([]);
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  
  // State for job descriptions
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [selectedJobDescription, setSelectedJobDescription] = useState(null);
  const [isLoadingJobDescriptions, setIsLoadingJobDescriptions] = useState(false);
  
  // State for candidate profile
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // State for evaluations
  const [evaluations, setEvaluations] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // State for skill evaluations
  const [skillEvaluations, setSkillEvaluations] = useState([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  
  // State for top candidates
  const [topCandidates, setTopCandidates] = useState([]);
  const [isLoadingTopCandidates, setIsLoadingTopCandidates] = useState(false);
  
  // State for comparison
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [resumes_to_compare, setResumesToCompare] = useState([]);
  
  // State for search/filter
  const [searchParams, setSearchParams] = useState({
    job_description_id: jobDescriptionId ? parseInt(jobDescriptionId) : null,
    min_match_score: null,
    status: null,
    skills: [],
    experience_years_min: null,
    limit: 20,
    offset: 0
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  
  // Load job descriptions
  useEffect(() => {
    const fetchJobDescriptions = async () => {
      try {
        setIsLoadingJobDescriptions(true);
        const data = await listJobDescriptions();
        setJobDescriptions(data);
        
        // If jobDescriptionId is provided, set it as selected
        if (jobDescriptionId) {
          const jd = data.find(jd => jd.id === parseInt(jobDescriptionId));
          if (jd) {
            setSelectedJobDescription(jd);
            setSearchParams(prev => ({
              ...prev,
              job_description_id: parseInt(jobDescriptionId)
            }));
          }
        }
      } catch (error) {
        toast.error('Failed to load job descriptions');
        console.error(error);
      } finally {
        setIsLoadingJobDescriptions(false);
      }
    };
    
    fetchJobDescriptions();
  }, [jobDescriptionId]);
  
  // Load resumes
  const loadResumes = useCallback(async () => {
    try {
      setIsLoadingResumes(true);
      const params = {};
      if (jobDescriptionId) {
        params.job_description_id = jobDescriptionId;
      }
      const data = await listResumes(params);
      setResumes(data);
    } catch (error) {
      toast.error('Failed to load resumes');
      console.error(error);
    } finally {
      setIsLoadingResumes(false);
    }
  }, [jobDescriptionId]);
  
  // Load resumes on component mount
  useEffect(() => {
    loadResumes();
  }, [loadResumes]);
  
  // Load resume details if resumeId is provided
  useEffect(() => {
    const fetchResumeDetails = async () => {
      if (resumeId) {
        try {
          // Get resume data
          const resumeData = await getResume(resumeId);
          setCurrentResume(resumeData);
          
          // Get candidate profile
          try {
            setIsLoadingProfile(true);
            const profileData = await getCandidateProfile(resumeId);
            setCandidateProfile(profileData);
          } catch (error) {
            console.error('Failed to load candidate profile:', error);
            // If profile doesn't exist yet, it might be still processing
            if (error.response && error.response.status === 404) {
              toast.info('Resume is still being processed. Profile not available yet.');
            } else {
              toast.error('Failed to load candidate profile');
            }
          } finally {
            setIsLoadingProfile(false);
          }
          
          // Get evaluations
          try {
            setIsLoadingEvaluations(true);
            const evaluationsData = await getResumeEvaluations(resumeId);
            setEvaluations(evaluationsData);
            
            // If jobDescriptionId is provided, get the specific evaluation
            if (jobDescriptionId) {
              try {
                const specificEvaluation = await getSpecificEvaluation(resumeId, jobDescriptionId);
                setCurrentEvaluation(specificEvaluation);
                
                // Also get skill evaluations
                setIsLoadingSkills(true);
                const skillsData = await getSkillEvaluations(resumeId, jobDescriptionId);
                setSkillEvaluations(skillsData);
              } catch (error) {
                console.error('Failed to load specific evaluation:', error);
                if (error.response && error.response.status === 404) {
                  toast.info('No evaluation found for this job description. You can create one.');
                } else {
                  toast.error('Failed to load evaluation');
                }
              }
            }
          } catch (error) {
            console.error('Failed to load evaluations:', error);
            toast.error('Failed to load evaluations');
          } finally {
            setIsLoadingEvaluations(false);
            setIsLoadingSkills(false);
          }
          
          // Set active tab to view
          setActiveTab(1);
        } catch (error) {
          toast.error('Failed to load resume details');
          console.error(error);
        }
      }
    };
    
    fetchResumeDetails();
  }, [resumeId, jobDescriptionId]);
  
  // Handle file upload
  const handleFileUpload = useCallback(async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploadingResume(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const jdId = selectedJobDescription ? selectedJobDescription.id : null;
        
        // Upload the file
        const result = await uploadResume(file, jdId);
        toast.success(`Resume "${file.name}" uploaded successfully`);
      }
      
      // Refresh the list of resumes
      await loadResumes();
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to upload resume');
      console.error(error);
    } finally {
      setIsUploadingResume(false);
    }
  }, [selectedJobDescription, loadResumes]);
  
  // Handle resume selection
  const handleResumeSelect = (resume) => {
    if (selectedJobDescription) {
      navigate(`/job-descriptions/${selectedJobDescription.id}/resumes/${resume.id}`);
    } else {
      navigate(`/resume-scanner/${resume.id}`);
    }
  };
  
  // Handle job description selection
  const handleJobDescriptionChange = (event) => {
    const jdId = event.target.value;
    const jd = jobDescriptions.find(jd => jd.id === jdId);
    setSelectedJobDescription(jd);
    setSearchParams(prev => ({
      ...prev,
      job_description_id: jdId
    }));
    
    // If we have a current resume, navigate to include the job description
    if (currentResume) {
      navigate(`/job-descriptions/${jdId}/resumes/${currentResume.id}`);
    }
  };
  
  // Handle resume parsing
  const handleParseResume = async (resumeId) => {
    try {
      await parseResume(resumeId);
      toast.success('Resume parsing started');
      
      // Refresh the resume list after a delay
      setTimeout(() => {
        loadResumes();
      }, 2000);
    } catch (error) {
      toast.error('Failed to parse resume');
      console.error(error);
    }
  };
  
  // Handle resume evaluation
  const handleEvaluateResume = async (resumeId, jobDescriptionId) => {
    if (!jobDescriptionId) {
      toast.error('Please select a job description first');
      return;
    }
    
    try {
      setIsEvaluating(true);
      await evaluateResume(resumeId, jobDescriptionId);
      toast.success('Resume evaluation started');
      
      // Refresh the evaluations after a delay
      setTimeout(async () => {
        try {
          const evaluationsData = await getResumeEvaluations(resumeId);
          setEvaluations(evaluationsData);
          
          // Try to get the specific evaluation
          try {
            const specificEvaluation = await getSpecificEvaluation(resumeId, jobDescriptionId);
            setCurrentEvaluation(specificEvaluation);
            
            // Also refresh skill evaluations
            const skillsData = await getSkillEvaluations(resumeId, jobDescriptionId);
            setSkillEvaluations(skillsData);
          } catch (error) {
            console.error('Failed to load specific evaluation:', error);
          }
        } catch (error) {
          console.error('Failed to refresh evaluations:', error);
        }
      }, 3000);
    } catch (error) {
      toast.error('Failed to evaluate resume');
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
  };
  
  // Handle batch evaluation
  const handleBatchEvaluate = async () => {
    if (!selectedJobDescription) {
      toast.error('Please select a job description first');
      return;
    }
    
    if (selectedResumes.length === 0) {
      toast.error('Please select at least one resume to evaluate');
      return;
    }
    
    try {
      setIsEvaluating(true);
      await batchEvaluateResumes(selectedJobDescription.id, selectedResumes);
      toast.success(`Batch evaluation started for ${selectedResumes.length} resumes`);
      
      // Clear selection
      setSelectedResumes([]);
      
      // Refresh the list after a delay
      setTimeout(() => {
        loadResumes();
      }, 3000);
    } catch (error) {
      toast.error('Failed to start batch evaluation');
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
  };
  
  // Handle resume download
  const handleDownloadResume = async (resumeId) => {
    try {
      const { download_url } = await getResumeDownloadUrl(resumeId);
      
      // Create a temporary link and click it to download
      const link = document.createElement('a');
      link.href = download_url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Failed to download resume');
      console.error(error);
    }
  };
  
  // Handle resume deletion
  const handleDeleteResume = async (resumeId) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await deleteResume(resumeId);
        toast.success('Resume deleted successfully');
        
        // If this was the current resume, clear it and navigate back
        if (currentResume && currentResume.id === resumeId) {
          setCurrentResume(null);
          setCandidateProfile(null);
          setEvaluations([]);
          setCurrentEvaluation(null);
          setSkillEvaluations([]);
          
          if (selectedJobDescription) {
            navigate(`/job-descriptions/${selectedJobDescription.id}/resumes`);
          } else {
            navigate('/resume-scanner');
          }
        }
        
        // Refresh the list
        await loadResumes();
      } catch (error) {
        toast.error('Failed to delete resume');
        console.error(error);
      }
    }
  };
  
  // Handle search
  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const results = await searchResumes(searchParams);
      setSearchResults(results);
      setActiveTab(3); // Switch to search results tab
    } catch (error) {
      toast.error('Failed to search resumes');
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle adding a skill to search params
  const handleAddSearchSkill = () => {
    if (skillInput.trim()) {
      setSearchParams(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };
  
  // Handle removing a skill from search params
  const handleRemoveSearchSkill = (skillToRemove) => {
    setSearchParams(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };
  
  // Handle loading top candidates
  const handleLoadTopCandidates = async () => {
    if (!selectedJobDescription) {
      toast.error('Please select a job description first');
      return;
    }
    
    try {
      setIsLoadingTopCandidates(true);
      const data = await getTopCandidates(selectedJobDescription.id, 10);
      setTopCandidates(data);
      setActiveTab(4); // Switch to top candidates tab
    } catch (error) {
      toast.error('Failed to load top candidates');
      console.error(error);
    } finally {
      setIsLoadingTopCandidates(false);
    }
  };
  
  // Handle comparing candidates
  const handleCompareResumes = async () => {
    if (!selectedJobDescription) {
      toast.error('Please select a job description first');
      return;
    }
    
    if (resumes_to_compare.length < 2) {
      toast.error('Please select at least two resumes to compare');
      return;
    }
    
    try {
      setIsLoadingComparison(true);
      const data = await compareCandidates(selectedJobDescription.id, resumes_to_compare);
      setComparisonData(data);
      setActiveTab(5); // Switch to comparison tab
    } catch (error) {
      toast.error('Failed to compare candidates');
      console.error(error);
    } finally {
      setIsLoadingComparison(false);
    }
  };
  
  // Handle checkbox selection for batch operations
  const handleCheckboxChange = (resumeId) => {
    setSelectedResumes(prev => {
      if (prev.includes(resumeId)) {
        return prev.filter(id => id !== resumeId);
      } else {
        return [...prev, resumeId];
      }
    });
  };
  
  // Handle checkbox selection for comparison
  const handleCompareCheckboxChange = (resumeId) => {
    setResumesToCompare(prev => {
      if (prev.includes(resumeId)) {
        return prev.filter(id => id !== resumeId);
      } else {
        return [...prev, resumeId];
      }
    });
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle evaluation status change
  const handleStatusChange = async (status) => {
    if (!currentEvaluation) return;
    
    try {
      await updateEvaluation(currentResume.id, selectedJobDescription.id, { status });
      setCurrentEvaluation(prev => ({ ...prev, status }));
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };
  
  // Go back to job description
  const handleBackToJobDescription = () => {
    if (selectedJobDescription) {
      navigate(`/job-descriptions/${selectedJobDescription.id}`);
    } else {
      navigate('/job-descriptions');
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', position: 'relative' }}
    >
      <FuturisticBackground color="#0064ff" />
      
      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton 
            color="primary" 
            onClick={handleBackToJobDescription}
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
            Resume Scanner
          </Typography>
          {selectedJobDescription && (
            <Chip 
              label={`Job: ${selectedJobDescription.title}`}
              color="secondary"
              sx={{ ml: 2, boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)' }}
            />
          )}
        </Stack>
        
        <Grid container spacing={4}>
          {/* Left sidebar - Controls and Resume List */}
          <Grid item xs={12} md={3}>
            <Stack spacing={3}>
              {/* Job Description Selection */}
              <GlowingCard color="secondary">
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Select Job Description
                  </Typography>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel id="job-description-label">Job Description</InputLabel>
                    <Select
                      labelId="job-description-label"
                      value={selectedJobDescription ? selectedJobDescription.id : ''}
                      onChange={handleJobDescriptionChange}
                      label="Job Description"
                      sx={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {jobDescriptions.map((jd) => (
                        <MenuItem key={jd.id} value={jd.id}>{jd.title}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <HolographicButton
                    fullWidth
                    startIcon={<UploadIcon />}
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploadingResume}
                    sx={{ mb: 1 }}
                  >
                    {isUploadingResume ? 'Uploading...' : 'Upload Resumes'}
                  </HolographicButton>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <HolographicButton
                      color="info"
                      size="small"
                      startIcon={<AssessmentIcon />}
                      onClick={handleLoadTopCandidates}
                      disabled={!selectedJobDescription}
                      sx={{ flex: 1 }}
                    >
                      Top Candidates
                    </HolographicButton>
                    
                    <HolographicButton
                      color="warning"
                      size="small"
                      startIcon={<CompareIcon />}
                      onClick={handleCompareResumes}
                      disabled={!selectedJobDescription || resumes_to_compare.length < 2}
                      sx={{ flex: 1 }}
                    >
                      Compare
                    </HolographicButton>
                  </Stack>
                  
                  {selectedResumes.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <HolographicButton
                        color="secondary"
                        fullWidth
                        startIcon={<AIIcon />}
                        onClick={handleBatchEvaluate}
                        disabled={isEvaluating || !selectedJobDescription}
                      >
                        {isEvaluating ? 'Evaluating...' : `Evaluate ${selectedResumes.length} Resumes`}
                      </HolographicButton>
                    </Box>
                  )}
                </Box>
              </GlowingCard>
              
              {/* Resume List */}
              <GlowingCard color="primary" sx={{ height: '100%' }}>
                <Box sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6">Resumes</Typography>
                    <IconButton 
                      color="primary" 
                      onClick={loadResumes}
                      disabled={isLoadingResumes}
                      size="small"
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Stack>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  {isLoadingResumes ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : resumes.length > 0 ? (
                    <List sx={{ maxHeight: '600px', overflow: 'auto' }}>
                      {resumes.map((resume) => (
                        <Paper
                          key={resume.id}
                          elevation={3}
                          sx={{
                            mb: 2,
                            p: 2,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: 'rgba(0, 0, 0, 0.2)',
                            backdropFilter: 'blur(10px)',
                            border: resume.id === (currentResume?.id || -1) ? '1px solid' : 'none',
                            borderColor: 'primary.main',
                            boxShadow: resume.id === (currentResume?.id || -1) 
                              ? '0 0 15px rgba(0, 100, 255, 0.5)' 
                              : 'none',
                            '&:hover': {
                              background: 'rgba(0, 0, 0, 0.4)',
                            }
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Checkbox
                              checked={selectedResumes.includes(resume.id)}
                              onChange={() => handleCheckboxChange(resume.id)}
                              onClick={(e) => e.stopPropagation()}
                              size="small"
                            />
                            <Checkbox
                              icon={<CompareIcon />}
                              checkedIcon={<CompareIcon />}
                              checked={resumes_to_compare.includes(resume.id)}
                              onChange={() => handleCompareCheckboxChange(resume.id)}
                              onClick={(e) => e.stopPropagation()}
                              size="small"
                              sx={{
                                color: 'warning.main',
                                '&.Mui-checked': {
                                  color: 'warning.main',
                                }
                              }}
                            />
                            <Box sx={{ flex: 1 }} onClick={() => handleResumeSelect(resume)}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {resume.file_name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                              </Typography>
                              <Chip 
                                size="small" 
                                label={resume.processing_status} 
                                color={STATUS_COLORS[resume.processing_status] || 'default'}
                                sx={{ mr: 1 }}
                              />
                              {resume.ai_processed && (
                                <Chip 
                                  size="small" 
                                  icon={<AIIcon />} 
                                  label="AI Processed" 
                                  color="secondary"
                                />
                              )}
                            </Box>
                            <Stack direction="column" spacing={1}>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadResume(resume.id);
                                }}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteResume(resume.id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                          
                          {resume.processing_status === 'pending' && (
                            <Box sx={{ mt: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AIIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleParseResume(resume.id);
                                }}
                                fullWidth
                              >
                                Parse Resume
                              </Button>
                            </Box>
                          )}
                          
                          {resume.processing_status === 'completed' && selectedJobDescription && (
                            <Box sx={{ mt: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AssessmentIcon />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEvaluateResume(resume.id, selectedJobDescription.id);
                                }}
                                fullWidth
                              >
                                Evaluate for {selectedJobDescription.title}
                              </Button>
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      No resumes found. Upload some resumes to get started.
                    </Typography>
                  )}
                </Box>
              </GlowingCard>
            </Stack>
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
                  <Tab label="Search" icon={<SearchIcon />} iconPosition="start" />
                  {currentResume && <Tab label="Resume" icon={<DescriptionIcon />} iconPosition="start" />}
                  {currentResume && candidateProfile && <Tab label="Candidate" icon={<PersonIcon />} iconPosition="start" />}
                  <Tab label="Search Results" icon={<FilterIcon />} iconPosition="start" />
                  <Tab label="Top Candidates" icon={<StarIcon />} iconPosition="start" />
                  <Tab label="Comparison" icon={<CompareIcon />} iconPosition="start" />
                </Tabs>
              </Box>
              
              {/* Search Tab */}
              <Box role="tabpanel" hidden={activeTab !== 0} sx={{ p: 3 }}>
                {activeTab === 0 && (
                  <Stack spacing={3}>
                    <Typography variant="h6">Search Resumes</Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="search-jd-label">Job Description</InputLabel>
                          <Select
                            labelId="search-jd-label"
                            value={searchParams.job_description_id || ''}
                            onChange={(e) => setSearchParams(prev => ({
                              ...prev,
                              job_description_id: e.target.value || null
                            }))}
                            label="Job Description"
                            sx={{
                              background: 'rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            <MenuItem value="">
                              <em>Any</em>
                            </MenuItem>
                            {jobDescriptions.map((jd) => (
                              <MenuItem key={jd.id} value={jd.id}>{jd.title}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="search-status-label">Status</InputLabel>
                          <Select
                            labelId="search-status-label"
                            value={searchParams.status || ''}
                            onChange={(e) => setSearchParams(prev => ({
                              ...prev,
                              status: e.target.value || null
                            }))}
                            label="Status"
                            sx={{
                              background: 'rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(10px)',
                            }}
                          >
                            <MenuItem value="">
                              <em>Any</em>
                            </MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="reviewed">Reviewed</MenuItem>
                            <MenuItem value="shortlisted">Shortlisted</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Minimum Match Score"
                          type="number"
                          InputProps={{
                            inputProps: { min: 0, max: 100 },
                            sx: {
                              background: 'rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                          value={searchParams.min_match_score || ''}
                          onChange={(e) => setSearchParams(prev => ({
                            ...prev,
                            min_match_score: e.target.value ? Number(e.target.value) : null
                          }))}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Minimum Experience (years)"
                          type="number"
                          InputProps={{
                            inputProps: { min: 0, step: 0.5 },
                            sx: {
                              background: 'rgba(0, 0, 0, 0.2)',
                              backdropFilter: 'blur(10px)',
                            }
                          }}
                          value={searchParams.experience_years_min || ''}
                          onChange={(e) => setSearchParams(prev => ({
                            ...prev,
                            experience_years_min: e.target.value ? Number(e.target.value) : null
                          }))}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <TextField
                            fullWidth
                            label="Add Required Skills"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            variant="outlined"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSearchSkill();
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
                            onClick={handleAddSearchSkill}
                            startIcon={<AddIcon />}
                          >
                            Add
                          </Button>
                        </Stack>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {searchParams.skills && searchParams.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              onDelete={() => handleRemoveSearchSkill(skill)}
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
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <HolographicButton
                        onClick={handleSearch}
                        disabled={isSearching}
                        startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                        color="info"
                      >
                        Search Resumes
                      </HolographicButton>
                    </Box>
                  </Stack>
                )}
              </Box>
              
              {/* Resume Tab */}
              <Box role="tabpanel" hidden={activeTab !== 1} sx={{ p: 3 }}>
                {activeTab === 1 && currentResume ? (
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h5" sx={{ 
                        color: 'secondary.main',
                        fontWeight: 'bold',
                        textShadow: '0 0 10px rgba(156, 39, 176, 0.5)'
                      }}>
                        {currentResume.file_name}
                      </Typography>
                      
                      <Stack direction="row" spacing={1}>
                        <HolographicButton
                          onClick={() => handleDownloadResume(currentResume.id)}
                          startIcon={<DownloadIcon />}
                          color="info"
                          size="small"
                        >
                          Download
                        </HolographicButton>
                        
                        {currentResume.processing_status === 'completed' && selectedJobDescription && (
                          <HolographicButton
                            onClick={() => handleEvaluateResume(currentResume.id, selectedJobDescription.id)}
                            startIcon={isEvaluating ? <CircularProgress size={20} /> : <AssessmentIcon />}
                            color="secondary"
                            size="small"
                            disabled={isEvaluating}
                          >
                            {isEvaluating ? 'Evaluating...' : 'Evaluate'}
                          </HolographicButton>
                        )}
                      </Stack>
                    </Box>
                    
                    <Paper sx={{ 
                      p: 3, 
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                    }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>File Information</Typography>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">File Name:</Typography>
                              <Typography variant="body2">{currentResume.file_name}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">File Type:</Typography>
                              <Typography variant="body2">{currentResume.file_type}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">File Size:</Typography>
                              <Typography variant="body2">
                                {currentResume.original_file_size 
                                  ? `${Math.round(currentResume.original_file_size / 1024)} KB` 
                                  : 'Unknown'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Uploaded:</Typography>
                              <Typography variant="body2">
                                {new Date(currentResume.created_at).toLocaleString()}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>Processing Status</Typography>
                          <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">Status:</Typography>
                              <Chip 
                                label={currentResume.processing_status} 
                                color={STATUS_COLORS[currentResume.processing_status] || 'default'}
                                size="small"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">AI Processed:</Typography>
                              <Chip 
                                label={currentResume.ai_processed ? 'Yes' : 'No'} 
                                color={currentResume.ai_processed ? 'success' : 'default'}
                                size="small"
                              />
                            </Box>
                            {currentResume.processing_status === 'pending' && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AIIcon />}
                                onClick={() => handleParseResume(currentResume.id)}
                                sx={{ mt: 1 }}
                              >
                                Parse Resume
                              </Button>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                    
                    {/* Evaluation Section */}
                    {currentEvaluation && (
                      <Paper sx={{ 
                        p: 3, 
                        background: 'rgba(0, 0, 0, 0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                      }}>
                        <Typography variant="h6" gutterBottom>
                          Evaluation for {selectedJobDescription?.title || 'Job Description'}
                        </Typography>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>Match Scores</Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Overall Match Score
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={currentEvaluation.overall_match_score} 
                                  sx={{ 
                                    flexGrow: 1, 
                                    height: 10, 
                                    borderRadius: 5,
                                    bgcolor: alpha(getScoreColor(currentEvaluation.overall_match_score), 0.2),
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: (theme) => theme.palette[getScoreColor(currentEvaluation.overall_match_score)].main,
                                      borderRadius: 5,
                                    }
                                  }} 
                                />
                                <Typography variant="h6" sx={{ 
                                  color: (theme) => theme.palette[getScoreColor(currentEvaluation.overall_match_score)].main,
                                  fontWeight: 'bold',
                                  width: 50, 
                                  textAlign: 'right' 
                                }}>
                                  {Math.round(currentEvaluation.overall_match_score)}%
                                </Typography>
                              </Box>
                            </Box>
                            
                            {currentEvaluation.experience_score !== null && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Experience Match
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={currentEvaluation.experience_score} 
                                    sx={{ 
                                      flexGrow: 1, 
                                      height: 8, 
                                      borderRadius: 4,
                                      bgcolor: alpha(getScoreColor(currentEvaluation.experience_score), 0.2),
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: (theme) => theme.palette[getScoreColor(currentEvaluation.experience_score)].main,
                                        borderRadius: 4,
                                      }
                                    }} 
                                  />
                                  <Typography variant="body2" sx={{ 
                                    color: (theme) => theme.palette[getScoreColor(currentEvaluation.experience_score)].main,
                                    width: 50, 
                                    textAlign: 'right' 
                                  }}>
                                    {Math.round(currentEvaluation.experience_score)}%
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                            
                            {currentEvaluation.education_score !== null && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Education Match
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={currentEvaluation.education_score} 
                                    sx={{ 
                                      flexGrow: 1, 
                                      height: 8, 
                                      borderRadius: 4,
                                      bgcolor: alpha(getScoreColor(currentEvaluation.education_score), 0.2),
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: (theme) => theme.palette[getScoreColor(currentEvaluation.education_score)].main,
                                        borderRadius: 4,
                                      }
                                    }} 
                                  />
                                  <Typography variant="body2" sx={{ 
                                    color: (theme) => theme.palette[getScoreColor(currentEvaluation.education_score)].main,
                                    width: 50, 
                                    textAlign: 'right' 
                                  }}>
                                    {Math.round(currentEvaluation.education_score)}%
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                            
                            {currentEvaluation.skills_score !== null && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Skills Match
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={currentEvaluation.skills_score} 
                                    sx={{ 
                                      flexGrow: 1, 
                                      height: 8, 
                                      borderRadius: 4,
                                      bgcolor: alpha(getScoreColor(currentEvaluation.skills_score), 0.2),
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: (theme) => theme.palette[getScoreColor(currentEvaluation.skills_score)].main,
                                        borderRadius: 4,
                                      }
                                    }} 
                                  />
                                  <Typography variant="body2" sx={{ 
                                    color: (theme) => theme.palette[getScoreColor(currentEvaluation.skills_score)].main,
                                    width: 50, 
                                    textAlign: 'right' 
                                  }}>
                                    {Math.round(currentEvaluation.skills_score)}%
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>Evaluation Status</Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                              <Chip 
                                label={currentEvaluation.status} 
                                color={STATUS_COLORS[currentEvaluation.status] || 'default'}
                              />
                              
                              <Chip 
                                label={currentEvaluation.ai_generated ? 'AI Generated' : 'Manual'} 
                                color={currentEvaluation.ai_generated ? 'secondary' : 'default'}
                                icon={currentEvaluation.ai_generated ? <AIIcon /> : undefined}
                              />
                            </Box>
                            
                            <Typography variant="subtitle2" gutterBottom>Update Status:</Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                color="info"
                                onClick={() => handleStatusChange('reviewed')}
                              >
                                Reviewed
                              </Button>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                color="success"
                                onClick={() => handleStatusChange('shortlisted')}
                              >
                                Shortlist
                              </Button>
                              <Button 
                                variant="outlined" 
                                size="small" 
                                color="error"
                                onClick={() => handleStatusChange('rejected')}
                              >
                                Reject
                              </Button>
                            </Stack>
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>Strengths</Typography>
                            {currentEvaluation.strengths && currentEvaluation.strengths.length > 0 ? (
                              <List dense>
                                {currentEvaluation.strengths.map((strength, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemText 
                                      primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <CheckIcon fontSize="small" color="success" />
                                          <Typography variant="body2">{strength}</Typography>
                                        </Box>
                                      } 
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No strengths identified
                              </Typography>
                            )}
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>Weaknesses</Typography>
                            {currentEvaluation.weaknesses && currentEvaluation.weaknesses.length > 0 ? (
                              <List dense>
                                {currentEvaluation.weaknesses.map((weakness, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemText 
                                      primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <CloseIcon fontSize="small" color="error" />
                                          <Typography variant="body2">{weakness}</Typography>
                                        </Box>
                                      } 
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No weaknesses identified
                              </Typography>
                            )}
                          </Grid>
                          
                          {currentEvaluation.evaluation_notes && (
                            <Grid item xs={12}>
                              <Typography variant="subtitle1" gutterBottom>Evaluation Notes</Typography>
                              <Paper sx={{ 
                                p: 2, 
                                background: 'rgba(0, 0, 0, 0.1)',
                                borderRadius: 1,
                              }}>
                                <Typography variant="body2">
                                  {currentEvaluation.evaluation_notes}
                                </Typography>
                              </Paper>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>
                    )}
                    
                    {/* Skill Evaluations */}
                    {skillEvaluations.length > 0 && (
                      <Paper sx={{ 
                        p: 3, 
                        background: 'rgba(0, 0, 0, 0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                      }}>
                        <Typography variant="h6" gutterBottom>Skill Evaluations</Typography>
                        
                        <Grid container spacing={2}>
                          {skillEvaluations.map((skill) => (
                            <Grid item xs={12} sm={6} md={4} key={skill.id}>
                              <Paper sx={{ 
                                p: 2, 
                                height: '100%',
                                background: alpha(getScoreColor(skill.skill_score), 0.1),
                                border: `1px solid ${alpha(getScoreColor(skill.skill_score), 0.3)}`,
                                borderRadius: 2,
                              }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  {skill.skill_name}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={skill.skill_score} 
                                    sx={{ 
                                      flexGrow: 1, 
                                      height: 6, 
                                      borderRadius: 3,
                                      bgcolor: alpha(getScoreColor(skill.skill_score), 0.2),
                                      '& .MuiLinearProgress-bar': {
                                        bgcolor: (theme) => theme.palette[getScoreColor(skill.skill_score)].main,
                                        borderRadius: 3,
                                      }
                                    }} 
                                  />
                                  <Typography variant="body2" sx={{ 
                                    color: (theme) => theme.palette[getScoreColor(skill.skill_score)].main,
                                    fontWeight: 'bold',
                                    width: 40, 
                                    textAlign: 'right' 
                                  }}>
                                    {Math.round(skill.skill_score)}%
                                  </Typography>
                                </Box>
                                
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Required: {skill.skill_required_level || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Detected: {skill.skill_detected_level || 'N/A'}
                                  </Typography>
                                </Stack>
                                
                                {skill.evaluation_notes && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    {skill.evaluation_notes}
                                  </Typography>
                                )}
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    )}
                  </Stack>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <Typography variant="body1" color="text.secondary">
                      No resume selected. Select a resume from the list or upload a new one.
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Candidate Profile Tab */}
              <Box role="tabpanel" hidden={activeTab !== 2} sx={{ p: 3 }}>
                {activeTab === 2 && currentResume && candidateProfile ? (
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h5" sx={{ 
                        color: 'info.main',
                        fontWeight: 'bold',
                        textShadow: '0 0 10px rgba(3, 169, 244, 0.5)'
                      }}>
                        {candidateProfile.name || 'Unnamed Candidate'}
                      </Typography>
                      
                      <Chip 
                        icon={<AIIcon />}
                        label={candidateProfile.ai_generated ? 'AI Generated' : 'Manual Entry'}
                        color={candidateProfile.ai_generated ? 'secondary' : 'default'}
                      />
                    </Box>
                    
                    <Paper sx={{ 
                      p: 3, 
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                    }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="subtitle1" gutterBottom>Contact Information</Typography>
                              <Stack spacing={1}>
                                {candidateProfile.email && (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>Email:</Typography>
                                    <Typography variant="body2">{candidateProfile.email}</Typography>
                                  </Box>
                                )}
                                {candidateProfile.phone && (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>Phone:</Typography>
                                    <Typography variant="body2">{candidateProfile.phone}</Typography>
                                  </Box>
                                )}
                                {candidateProfile.location && (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>Location:</Typography>
                                    <Typography variant="body2">{candidateProfile.location}</Typography>
                                  </Box>
                                )}
                              </Stack>
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle1" gutterBottom>Professional Summary</Typography>
                              <Typography variant="body2">
                                {candidateProfile.summary || 'No summary available'}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle1" gutterBottom>Experience</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">Years of Experience:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {candidateProfile.experience_years !== null 
                                    ? `${candidateProfile.experience_years} years` 
                                    : 'Not specified'}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle1" gutterBottom>Online Profiles</Typography>
                              <Stack spacing={1}>
                                {candidateProfile.linkedin_url && (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>LinkedIn:</Typography>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                      {candidateProfile.linkedin_url}
                                    </Typography>
                                  </Box>
                                )}
                                {candidateProfile.github_url && (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>GitHub:</Typography>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                      {candidateProfile.github_url}
                                    </Typography>
                                  </Box>
                                )}
                                {candidateProfile.portfolio_url && (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 80 }}>Portfolio:</Typography>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                      {candidateProfile.portfolio_url}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </Box>
                          </Stack>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>Skills</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {candidateProfile.skills && candidateProfile.skills.length > 0 ? (
                                candidateProfile.skills.map((skill, index) => (
                                  <Chip 
                                    key={index} 
                                    label={skill} 
                                    color="primary" 
                                    variant="outlined"
                                    size="small"
                                    sx={{ borderRadius: 1 }}
                                  />
                                ))
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No skills listed
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>Certifications</Typography>
                            {candidateProfile.certifications && candidateProfile.certifications.length > 0 ? (
                              <List dense>
                                {candidateProfile.certifications.map((cert, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemText primary={cert} />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No certifications listed
                              </Typography>
                            )}
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle1" gutterBottom>Languages</Typography>
                            {candidateProfile.languages && candidateProfile.languages.length > 0 ? (
                              <List dense>
                                {candidateProfile.languages.map((lang, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemText 
                                      primary={`${lang.language} (${lang.proficiency})`} 
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No languages listed
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                    
                    {/* Education History */}
                    <Paper sx={{ 
                      p: 3, 
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                    }}>
                      <Typography variant="h6" gutterBottom>Education History</Typography>
                      
                      {candidateProfile.education && candidateProfile.education.length > 0 ? (
                        <Grid container spacing={2}>
                          {candidateProfile.education.map((edu, index) => (
                            <Grid item xs={12} md={6} key={index}>
                              <Paper sx={{ 
                                p: 2, 
                                background: 'rgba(0, 0, 0, 0.1)',
                                borderRadius: 1,
                              }}>
                                <Typography variant="subtitle1">{edu.institution}</Typography>
                                <Typography variant="body2" color="primary.main">
                                  {edu.degree} in {edu.field_of_study}
                                </Typography>
                                {(edu.start_date || edu.end_date) && (
                                  <Typography variant="body2" color="text.secondary">
                                    {edu.start_date || 'N/A'} - {edu.end_date || 'Present'}
                                  </Typography>
                                )}
                                {edu.gpa && (
                                  <Typography variant="body2" color="text.secondary">
                                    GPA: {edu.gpa}
                                  </Typography>
                                )}
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No education history available
                        </Typography>
                      )}
                    </Paper>
                    
                    {/* Work History */}
                    <Paper sx={{ 
                      p: 3, 
                      background: 'rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                    }}>
                      <Typography variant="h6" gutterBottom>Work History</Typography>
                      
                      {candidateProfile.work_history && candidateProfile.work_history.length > 0 ? (
                        <Stack spacing={2}>
                          {candidateProfile.work_history.map((job, index) => (
                            <Paper 
                              key={index}
                              sx={{ 
                                p: 2, 
                                background: 'rgba(0, 0, 0, 0.1)',
                                borderRadius: 1,
                                borderLeft: '3px solid',
                                borderColor: job.is_current ? 'primary.main' : 'text.disabled',
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="subtitle1">{job.title}</Typography>
                                  <Typography variant="body2" color="primary.main">
                                    {job.company}
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {job.start_date || 'N/A'} - {job.end_date || 'Present'}
                                  </Typography>
                                  {job.location && (
                                    <Typography variant="body2" color="text.secondary">
                                      {job.location}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              
                              {job.description && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                  {job.description}
                                </Typography>
                              )}
                              
                              {job.achievements && job.achievements.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" fontWeight="bold">Key Achievements:</Typography>
                                  <List dense>
                                    {job.achievements.map((achievement, i) => (
                                      <ListItem key={i} sx={{ py: 0.5 }}>
                                        <ListItemText primary={achievement} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}
                            </Paper>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No work history available
                        </Typography>
                      )}
                    </Paper>
                  </Stack>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <Typography variant="body1" color="text.secondary">
                      No candidate profile available. Select a processed resume to view candidate details.
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Search Results Tab */}
              <Box role="tabpanel" hidden={activeTab !== 3} sx={{ p: 3 }}>
                {activeTab === 3 && (
                  <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Search Results</Typography>
                      <HolographicButton
                        color="info"
                        size="small"
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                      >
                        Refresh Results
                      </HolographicButton>
                    </Box>
                    
                    {isSearching ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                      </Box>
                    ) : searchResults.length > 0 ? (
                      <Grid container spacing={2}>
                        {searchResults.map((result) => (
                          <Grid item xs={12} md={6} lg={4} key={result.resume_id}>
                            <Paper
                              sx={{
                                p: 2,
                                height: '100%',
                                background: 'rgba(0, 0, 0, 0.2)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
                                },
                                cursor: 'pointer',
                              }}
                              onClick={() => handleResumeSelect({ id: result.resume_id })}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {result.candidate_name || 'Unnamed Candidate'}
                                </Typography>
                                <Chip 
                                  label={`${Math.round(result.match_score)}%`} 
                                  color={getScoreColor(result.match_score)}
                                  size="small"
                                />
                              </Box>
                              
                              <Stack spacing={1} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Experience:</Typography>
                                  <Typography variant="body2">
                                    {result.experience_years ? `${result.experience_years} years` : 'N/A'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Location:</Typography>
                                  <Typography variant="body2">{result.location || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ width: 100 }}>Status:</Typography>
                                  <Chip 
                                    label={result.status} 
                                    color={STATUS_COLORS[result.status] || 'default'}
                                    size="small"
                                  />
                                </Box>
                              </Stack>
                              
                              <Typography variant="body2" color="text.secondary" gutterBottom>Skills:</Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {result.skills && result.skills.length > 0 ? (
                                  result.skills.slice(0, 5).map((skill, index) => (
                                    <Chip 
                                      key={index} 
                                      label={skill} 
                                      color="primary" 
                                      variant="outlined"
                                      size="small"
                                      sx={{ borderRadius: 1 }}
                                    />
                                  ))
                                )