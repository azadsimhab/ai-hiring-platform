from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from .base import BaseModel

class ResumeStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Resume(BaseModel):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(50), nullable=False)
    content_text = Column(Text, nullable=True)  # Extracted text content
    content_structure = Column(JSON, nullable=True)  # Structured content (sections, etc.)
    original_file_size = Column(Integer, nullable=True)  # Size in bytes
    processing_status = Column(String(50), default="pending")  # pending, processing, completed, failed
    ai_processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    job_description = relationship("JobDescription", back_populates="resumes")
    candidate_profile = relationship("CandidateProfile", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    resume_evaluation = relationship("ResumeEvaluation", back_populates="resume", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Resume(id={self.id}, file_name='{self.file_name}', status='{self.processing_status}')>"


class CandidateProfile(BaseModel):
    __tablename__ = "candidate_profiles"
    
    # Basic information
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    candidate = relationship("Candidate", back_populates="profile")
    
    # Extracted information from resume
    full_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    
    # Professional summary
    summary = Column(Text, nullable=True)
    current_position = Column(String(255), nullable=True)
    current_company = Column(String(255), nullable=True)
    years_of_experience = Column(Float, nullable=True)
    
    # Detailed information (stored as JSON for SQLite compatibility)
    education = Column(JSON, nullable=True, default=[])  # Array of education entries
    skills = Column(JSON, nullable=True, default=[])  # Array of skills
    work_history = Column(JSON, nullable=True, default=[])  # Array of work experience
    certifications = Column(JSON, nullable=True, default=[])  # Array of certifications
    languages = Column(JSON, nullable=True, default=[])  # Array of languages
    
    # Social and professional links
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    
    # AI Analysis results
    ai_skills_analysis = Column(JSON, nullable=True)  # Detailed skills analysis
    ai_experience_analysis = Column(JSON, nullable=True)  # Experience breakdown
    ai_education_analysis = Column(JSON, nullable=True)  # Education analysis
    ai_cultural_fit_analysis = Column(JSON, nullable=True)  # Cultural fit assessment
    
    # Scoring
    technical_score = Column(Float, nullable=True)  # 0-100
    experience_score = Column(Float, nullable=True)  # 0-100
    education_score = Column(Float, nullable=True)  # 0-100
    cultural_fit_score = Column(Float, nullable=True)  # 0-100
    overall_score = Column(Float, nullable=True)  # 0-100
    
    # Detailed analysis
    strengths = Column(JSON, nullable=True, default=[])  # Array of strengths
    weaknesses = Column(JSON, nullable=True, default=[])  # Array of weaknesses
    recommendations = Column(Text, nullable=True)  # AI recommendations
    
    # Processing metadata
    processing_time_seconds = Column(Float, nullable=True)
    ai_model_version = Column(String(50), nullable=True)
    confidence_score = Column(Float, nullable=True)  # AI confidence in analysis
    
    # Status
    status = Column(Enum(ResumeStatus), default=ResumeStatus.PENDING, nullable=False)
    error_message = Column(Text, nullable=True)
    
    @property
    def is_completed(self):
        return self.status == ResumeStatus.COMPLETED
    
    @property
    def is_failed(self):
        return self.status == ResumeStatus.FAILED
    
    @property
    def has_analysis(self):
        return self.overall_score is not None

class SkillEvaluation(BaseModel):
    __tablename__ = "skill_evaluations"
    
    # Relationships
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    candidate = relationship("Candidate", back_populates="skill_evaluations")
    
    # Skill information
    skill_name = Column(String(255), nullable=False)
    skill_category = Column(String(100), nullable=True)  # e.g., "Programming", "Soft Skills"
    
    # Evaluation scores
    proficiency_level = Column(String(50), nullable=True)  # "Beginner", "Intermediate", "Advanced", "Expert"
    confidence_score = Column(Float, nullable=True)  # 0-100
    years_of_experience = Column(Float, nullable=True)
    
    # AI Analysis
    ai_analysis = Column(JSON, nullable=True)  # Detailed AI analysis of the skill
    evidence_from_resume = Column(Text, nullable=True)  # Supporting evidence
    
    # Relevance to job
    relevance_to_job = Column(Float, nullable=True)  # 0-100 how relevant this skill is
    job_requirement_match = Column(Float, nullable=True)  # 0-100 match with job requirements
    
    # Metadata
    evaluation_date = Column(DateTime(timezone=True), nullable=False)
    evaluator_type = Column(String(50), nullable=False)  # "ai", "human", "test"
    
    @property
    def is_highly_relevant(self):
        return self.relevance_to_job and self.relevance_to_job >= 80
    
    @property
    def is_expert_level(self):
        return self.proficiency_level == "Expert" and self.confidence_score and self.confidence_score >= 90

class ResumeEvaluation(BaseModel):
    __tablename__ = "resume_evaluations"
    
    # Resume file information
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    resume = relationship("Resume", back_populates="evaluations")
    
    # AI Analysis results
    skills_analysis = Column(JSON, nullable=True)  # Extracted skills with confidence scores
    experience_analysis = Column(JSON, nullable=True)  # Work experience analysis
    education_analysis = Column(JSON, nullable=True)  # Education background
    cultural_fit_analysis = Column(JSON, nullable=True)  # Cultural fit assessment
    
    # Scoring
    technical_score = Column(Float, nullable=True)  # 0-100
    experience_score = Column(Float, nullable=True)  # 0-100
    education_score = Column(Float, nullable=True)  # 0-100
    cultural_fit_score = Column(Float, nullable=True)  # 0-100
    overall_score = Column(Float, nullable=True)  # 0-100
    
    # Detailed analysis
    strengths = Column(JSON, nullable=True)  # Array of strengths
    weaknesses = Column(JSON, nullable=True)  # Array of weaknesses
    recommendations = Column(Text, nullable=True)  # AI recommendations
    
    # Processing metadata
    processing_time_seconds = Column(Float, nullable=True)
    ai_model_version = Column(String(50), nullable=True)
    confidence_score = Column(Float, nullable=True)  # AI confidence in analysis
    
    # Status
    status = Column(Enum(ResumeStatus), default=ResumeStatus.PENDING, nullable=False)
    error_message = Column(Text, nullable=True)
    
    @property
    def is_completed(self):
        return self.status == ResumeStatus.COMPLETED
    
    @property
    def is_failed(self):
        return self.status == ResumeStatus.FAILED
