from pydantic import BaseModel, Field, validator, HttpUrl, EmailStr
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import re

# Resume Schemas
class ResumeBase(BaseModel):
    job_description_id: Optional[int] = Field(
        None, 
        description="ID of the associated job description",
        example=1
    )
    file_name: str = Field(
        ..., 
        description="Original file name of the resume",
        example="john_doe_resume.pdf"
    )
    file_type: str = Field(
        ..., 
        description="MIME type of the resume file",
        example="application/pdf"
    )


class ResumeCreate(ResumeBase):
    file_path: str = Field(
        ..., 
        description="Path to the stored resume file",
        example="resumes/2023/07/john_doe_resume.pdf"
    )
    original_file_size: Optional[int] = Field(
        None, 
        description="Size of the original file in bytes",
        example=245000
    )
    content_text: Optional[str] = Field(
        None, 
        description="Extracted text content from the resume",
        example="John Doe\nSoftware Engineer\n..."
    )
    content_structure: Optional[Dict[str, Any]] = Field(
        None, 
        description="Structured content extracted from the resume"
    )
    processing_status: str = Field(
        "pending", 
        description="Status of resume processing",
        example="pending"
    )


class ResumeUpdate(BaseModel):
    job_description_id: Optional[int] = None
    content_text: Optional[str] = None
    content_structure: Optional[Dict[str, Any]] = None
    processing_status: Optional[str] = None
    ai_processed: Optional[bool] = None
    
    class Config:
        validate_assignment = True


class ResumeResponse(ResumeBase):
    id: int
    file_path: str
    original_file_size: Optional[int] = None
    processing_status: str
    ai_processed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


# Candidate Profile Schemas
class EducationItem(BaseModel):
    institution: str = Field(..., description="Name of educational institution", example="Stanford University")
    degree: str = Field(..., description="Degree obtained", example="Bachelor of Science")
    field_of_study: str = Field(..., description="Field of study", example="Computer Science")
    start_date: Optional[str] = Field(None, description="Start date", example="2015-09")
    end_date: Optional[str] = Field(None, description="End date", example="2019-06")
    gpa: Optional[float] = Field(None, description="Grade Point Average", example=3.8)
    description: Optional[str] = Field(None, description="Additional details about education")


class WorkHistoryItem(BaseModel):
    company: str = Field(..., description="Company name", example="Google")
    title: str = Field(..., description="Job title", example="Senior Software Engineer")
    location: Optional[str] = Field(None, description="Job location", example="Mountain View, CA")
    start_date: Optional[str] = Field(None, description="Start date", example="2019-07")
    end_date: Optional[str] = Field(None, description="End date (empty if current)", example="2022-03")
    is_current: Optional[bool] = Field(False, description="Whether this is the current job")
    description: Optional[str] = Field(None, description="Job description")
    achievements: Optional[List[str]] = Field(None, description="Key achievements in this role")


class LanguageItem(BaseModel):
    language: str = Field(..., description="Language name", example="English")
    proficiency: str = Field(..., description="Proficiency level", example="Native")


class CandidateProfileBase(BaseModel):
    name: Optional[str] = Field(None, description="Candidate's full name", example="John Doe")
    email: Optional[str] = Field(None, description="Candidate's email address", example="john.doe@example.com")
    phone: Optional[str] = Field(None, description="Candidate's phone number", example="+1 (555) 123-4567")
    location: Optional[str] = Field(None, description="Candidate's location", example="San Francisco, CA")
    summary: Optional[str] = Field(None, description="Professional summary")
    experience_years: Optional[float] = Field(None, description="Years of experience", example=5.5)
    skills: Optional[List[str]] = Field(None, description="List of skills")
    certifications: Optional[List[str]] = Field(None, description="List of certifications")
    linkedin_url: Optional[str] = Field(None, description="LinkedIn profile URL")
    github_url: Optional[str] = Field(None, description="GitHub profile URL")
    portfolio_url: Optional[str] = Field(None, description="Portfolio website URL")
    
    @validator('email')
    def validate_email(cls, v):
        if v is not None:
            pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
            if not re.match(pattern, v):
                raise ValueError('Invalid email format')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if v is not None:
            # Remove common separators for validation
            cleaned = re.sub(r'[\s\-\(\)\.]', '', v)
            # Check if it's a valid phone number format
            if not re.match(r'^\+?[0-9]{10,15}$', cleaned):
                raise ValueError('Invalid phone number format')
        return v


class CandidateProfileCreate(CandidateProfileBase):
    resume_id: int = Field(..., description="ID of the associated resume", example=1)
    education: Optional[List[EducationItem]] = Field(None, description="Education history")
    work_history: Optional[List[WorkHistoryItem]] = Field(None, description="Work history")
    languages: Optional[List[LanguageItem]] = Field(None, description="Language proficiencies")


class CandidateProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    experience_years: Optional[float] = None
    education: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None
    work_history: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[str]] = None
    languages: Optional[List[Dict[str, Any]]] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    ai_generated: Optional[bool] = None
    
    class Config:
        validate_assignment = True


class CandidateProfileResponse(CandidateProfileBase):
    id: int
    resume_id: int
    education: List[Dict[str, Any]] = Field(default_factory=list)
    work_history: List[Dict[str, Any]] = Field(default_factory=list)
    languages: List[Dict[str, Any]] = Field(default_factory=list)
    ai_generated: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


# Skill Evaluation Schemas
class SkillEvaluationBase(BaseModel):
    skill_name: str = Field(..., description="Name of the skill being evaluated", example="Python")
    skill_score: float = Field(
        ..., 
        description="Score for the skill (0-100)",
        example=85.5,
        ge=0,
        le=100
    )
    skill_required_level: Optional[str] = Field(
        None, 
        description="Required skill level from job description",
        example="advanced"
    )
    skill_detected_level: Optional[str] = Field(
        None, 
        description="Detected skill level from resume",
        example="intermediate"
    )
    confidence: float = Field(
        ..., 
        description="Confidence level of the evaluation (0-1)",
        example=0.92,
        ge=0,
        le=1
    )
    evaluation_notes: Optional[str] = Field(
        None, 
        description="Notes about the skill evaluation"
    )


class SkillEvaluationCreate(SkillEvaluationBase):
    candidate_profile_id: int = Field(..., description="ID of the candidate profile", example=1)
    job_description_id: int = Field(..., description="ID of the job description", example=1)


class SkillEvaluationUpdate(BaseModel):
    skill_score: Optional[float] = None
    skill_required_level: Optional[str] = None
    skill_detected_level: Optional[str] = None
    confidence: Optional[float] = None
    evaluation_notes: Optional[str] = None
    
    class Config:
        validate_assignment = True


class SkillEvaluationResponse(SkillEvaluationBase):
    id: int
    candidate_profile_id: int
    job_description_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


# Resume Evaluation Schemas
class ResumeEvaluationBase(BaseModel):
    overall_match_score: float = Field(
        ..., 
        description="Overall match score (0-100)",
        example=78.5,
        ge=0,
        le=100
    )
    experience_score: Optional[float] = Field(
        None, 
        description="Experience match score (0-100)",
        example=85.0,
        ge=0,
        le=100
    )
    education_score: Optional[float] = Field(
        None, 
        description="Education match score (0-100)",
        example=90.0,
        ge=0,
        le=100
    )
    skills_score: Optional[float] = Field(
        None, 
        description="Skills match score (0-100)",
        example=75.0,
        ge=0,
        le=100
    )
    strengths: Optional[List[str]] = Field(
        None, 
        description="Candidate strengths relative to job requirements"
    )
    weaknesses: Optional[List[str]] = Field(
        None, 
        description="Candidate weaknesses relative to job requirements"
    )
    evaluation_notes: Optional[str] = Field(
        None, 
        description="Overall evaluation notes"
    )
    status: str = Field(
        "pending", 
        description="Evaluation status",
        example="pending"
    )


class ResumeEvaluationCreate(ResumeEvaluationBase):
    resume_id: int = Field(..., description="ID of the resume", example=1)
    job_description_id: int = Field(..., description="ID of the job description", example=1)


class ResumeEvaluationUpdate(BaseModel):
    overall_match_score: Optional[float] = None
    experience_score: Optional[float] = None
    education_score: Optional[float] = None
    skills_score: Optional[float] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    evaluation_notes: Optional[str] = None
    status: Optional[str] = None
    ai_generated: Optional[bool] = None
    
    class Config:
        validate_assignment = True


class ResumeEvaluationResponse(ResumeEvaluationBase):
    id: int
    resume_id: int
    job_description_id: int
    ai_generated: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


# Special Request Schemas
class ParseResumeRequest(BaseModel):
    resume_id: int = Field(..., description="ID of the resume to parse", example=1)


class EvaluateResumeRequest(BaseModel):
    resume_id: int = Field(..., description="ID of the resume to evaluate", example=1)
    job_description_id: int = Field(..., description="ID of the job description to evaluate against", example=1)


class BatchEvaluateRequest(BaseModel):
    job_description_id: int = Field(..., description="ID of the job description to evaluate against", example=1)
    resume_ids: List[int] = Field(..., description="List of resume IDs to evaluate", example=[1, 2, 3])


class ResumeUploadResponse(BaseModel):
    resume_id: int
    file_name: str
    message: str = "Resume uploaded successfully"
    processing_status: str


class ResumeSearchParams(BaseModel):
    job_description_id: Optional[int] = None
    min_match_score: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years_min: Optional[float] = None
    limit: Optional[int] = Field(20, ge=1, le=100)
    offset: Optional[int] = Field(0, ge=0)


class ResumeComparisonResponse(BaseModel):
    job_description: Dict[str, Any]
    candidates: List[Dict[str, Any]]
    comparison_metrics: Dict[str, Any]
