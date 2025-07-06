from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float, ARRAY, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class Resume(Base):
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


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False, unique=True)
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    experience_years = Column(Float, nullable=True)
    education = Column(ARRAY(JSON), nullable=True, default=[])
    skills = Column(ARRAY(String), nullable=True, default=[])
    work_history = Column(ARRAY(JSON), nullable=True, default=[])
    certifications = Column(ARRAY(String), nullable=True, default=[])
    languages = Column(ARRAY(JSON), nullable=True, default=[])
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="candidate_profile")
    skill_evaluations = relationship("SkillEvaluation", back_populates="candidate_profile", cascade="all, delete-orphan")
    # Link to multimodal screening sessions (one candidate → many sessions)
    interview_sessions = relationship(
        "InterviewSession",
        back_populates="candidate_profile",
        cascade="all, delete-orphan",
    )
    # Link to coding test sessions (one candidate → many coding test attempts)
    coding_test_sessions = relationship(
        "CodingTestSession",
        back_populates="candidate_profile",
        cascade="all, delete-orphan",
    )
    
    def __repr__(self):
        return f"<CandidateProfile(id={self.id}, name='{self.name}', experience_years={self.experience_years})>"


class SkillEvaluation(Base):
    __tablename__ = "skill_evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    candidate_profile_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    skill_name = Column(String(255), nullable=False)
    skill_score = Column(Float, nullable=False)  # 0-100 score
    skill_required_level = Column(String(50), nullable=True)  # beginner, intermediate, advanced, expert
    skill_detected_level = Column(String(50), nullable=True)  # beginner, intermediate, advanced, expert
    confidence = Column(Float, nullable=False)  # 0-1 confidence level
    evaluation_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    candidate_profile = relationship("CandidateProfile", back_populates="skill_evaluations")
    job_description = relationship("JobDescription")
    
    def __repr__(self):
        return f"<SkillEvaluation(id={self.id}, skill='{self.skill_name}', score={self.skill_score})>"


class ResumeEvaluation(Base):
    __tablename__ = "resume_evaluations"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False, unique=True)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    overall_match_score = Column(Float, nullable=False)  # 0-100 score
    experience_score = Column(Float, nullable=True)  # 0-100 score
    education_score = Column(Float, nullable=True)  # 0-100 score
    skills_score = Column(Float, nullable=True)  # 0-100 score
    strengths = Column(ARRAY(Text), nullable=True, default=[])
    weaknesses = Column(ARRAY(Text), nullable=True, default=[])
    evaluation_notes = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, reviewed, shortlisted, rejected
    ai_generated = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="resume_evaluation")
    job_description = relationship("JobDescription")
    
    def __repr__(self):
        return f"<ResumeEvaluation(id={self.id}, match_score={self.overall_match_score}, status='{self.status}')>"
