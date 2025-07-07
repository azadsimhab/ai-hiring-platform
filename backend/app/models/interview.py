from sqlalchemy import Column, String, Text, Enum, Integer, ForeignKey, Float, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel
import enum

class InterviewType(str, enum.Enum):
    PHONE_SCREEN = "phone_screen"
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    CULTURAL_FIT = "cultural_fit"
    FINAL = "final"
    MULTIMODAL_AI = "multimodal_ai"

class InterviewStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class Interview(BaseModel):
    __tablename__ = "interviews"
    
    # Basic information
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    interview_type = Column(Enum(InterviewType), nullable=False)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED, nullable=False)
    
    # Scheduling
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=60, nullable=False)
    timezone = Column(String(50), default="UTC", nullable=False)
    
    # Participants
    interviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    interviewer = relationship("User", back_populates="interviews")
    
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    candidate = relationship("Candidate", back_populates="interviews")
    
    hiring_request_id = Column(Integer, ForeignKey("hiring_requests.id"), nullable=False)
    hiring_request = relationship("HiringRequest", back_populates="interviews")
    
    # Meeting details
    meeting_url = Column(String(500), nullable=True)
    meeting_id = Column(String(100), nullable=True)
    meeting_password = Column(String(100), nullable=True)
    
    # AI Interview specific fields
    ai_questions = Column(JSON, nullable=True)  # Pre-generated AI questions
    ai_analysis = Column(JSON, nullable=True)  # AI analysis of responses
    ai_score = Column(Float, nullable=True)  # 0-100 AI assessment score
    
    # Interview results
    notes = Column(Text, nullable=True)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    overall_rating = Column(Float, nullable=True)  # 1-5 rating
    recommendation = Column(String(50), nullable=True)  # hire, no_hire, maybe
    
    # Technical assessment
    technical_skills_rating = Column(Float, nullable=True)
    problem_solving_rating = Column(Float, nullable=True)
    communication_rating = Column(Float, nullable=True)
    cultural_fit_rating = Column(Float, nullable=True)
    
    # Follow-up
    follow_up_required = Column(Boolean, default=False, nullable=False)
    next_interview_scheduled = Column(Boolean, default=False, nullable=False)
    feedback_sent = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    tags = Column(JSON, nullable=True)
    internal_notes = Column(Text, nullable=True)
    
    @property
    def is_completed(self):
        return self.status == InterviewStatus.COMPLETED
    
    @property
    def is_cancelled(self):
        return self.status in [InterviewStatus.CANCELLED, InterviewStatus.NO_SHOW]
    
    @property
    def is_ai_interview(self):
        return self.interview_type == InterviewType.MULTIMODAL_AI 