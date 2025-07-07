from sqlalchemy import Column, String, Text, Enum, Integer, ForeignKey, Float, DateTime, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel
import enum

class HiringRequestStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class HiringRequestPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class HiringRequest(BaseModel):
    __tablename__ = "hiring_requests"
    
    # Basic information
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    
    # Job details
    department = Column(String(100), nullable=False)
    position = Column(String(100), nullable=False)
    location = Column(String(100), nullable=True)
    employment_type = Column(String(50), nullable=False)  # full-time, part-time, contract, etc.
    
    # Requirements
    min_experience_years = Column(Integer, nullable=True)
    max_experience_years = Column(Integer, nullable=True)
    required_skills = Column(JSON, nullable=True)  # List of required skills
    preferred_skills = Column(JSON, nullable=True)  # List of preferred skills
    education_requirements = Column(Text, nullable=True)
    
    # Budget and timeline
    salary_range_min = Column(Float, nullable=True)
    salary_range_max = Column(Float, nullable=True)
    currency = Column(String(3), default="USD", nullable=False)
    target_start_date = Column(DateTime(timezone=True), nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True)
    
    # Status and priority
    status = Column(Enum(HiringRequestStatus), default=HiringRequestStatus.DRAFT, nullable=False)
    priority = Column(Enum(HiringRequestPriority), default=HiringRequestPriority.MEDIUM, nullable=False)
    
    # AI-generated content
    ai_generated_jd = Column(Text, nullable=True)
    ai_generated_questions = Column(JSON, nullable=True)  # List of interview questions
    ai_analysis = Column(JSON, nullable=True)  # AI analysis results
    
    # Metadata
    tags = Column(JSON, nullable=True)  # List of tags
    internal_notes = Column(Text, nullable=True)
    
    # Relationships
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by = relationship("User", back_populates="hiring_requests", foreign_keys=[created_by_id])
    
    # Approvals
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = relationship("User", back_populates="approved_hiring_requests", foreign_keys=[approved_by_id])
    
    # Candidates
    candidates = relationship("Candidate", back_populates="hiring_request")
    
    # Interviews
    interviews = relationship("Interview", back_populates="hiring_request")
    
    @property
    def is_approved(self):
        return self.status == HiringRequestStatus.APPROVED
    
    @property
    def is_active(self):
        return self.status in [
            HiringRequestStatus.APPROVED,
            HiringRequestStatus.IN_PROGRESS
        ]
    
    @property
    def candidate_count(self):
        return len(self.candidates) if self.candidates else 0