from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base_class import Base

# Define Enums for status fields
class InterviewStatus(enum.Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"
    failed = "failed"

class SessionType(enum.Enum):
    ai_only = "ai_only"
    human_in_loop = "human_in_loop"

class ResponseStatus(enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_profile_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)

    status = Column(Enum(InterviewStatus), nullable=False, default=InterviewStatus.scheduled)
    session_type = Column(Enum(SessionType), nullable=False, default=SessionType.ai_only)
    
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    
    overall_ai_evaluation = Column(JSON, nullable=True) # Summary of the entire interview
    human_notes = Column(Text, nullable=True) # Notes from a human reviewer

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    candidate_profile = relationship("CandidateProfile", back_populates="interview_sessions")
    job_description = relationship("JobDescription")
    screening_questions = relationship("ScreeningQuestion", back_populates="interview_session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<InterviewSession(id={self.id}, candidate_id={self.candidate_profile_id}, status='{self.status.value}')>"

class ScreeningQuestion(Base):
    __tablename__ = "screening_questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    original_question_id = Column(Integer, ForeignKey("interview_questions.id"), nullable=True) # Link to pre-generated questions

    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False) # e.g., 'behavioral', 'technical', 'follow_up'
    order = Column(Integer, nullable=False) # Sequence of the question in the interview

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    interview_session = relationship("InterviewSession", back_populates="screening_questions")
    original_question = relationship("InterviewQuestion")
    candidate_response = relationship("CandidateResponse", back_populates="screening_question", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ScreeningQuestion(id={self.id}, order={self.order}, type='{self.question_type}')>"

class CandidateResponse(Base):
    __tablename__ = "candidate_responses"

    id = Column(Integer, primary_key=True, index=True)
    screening_question_id = Column(Integer, ForeignKey("screening_questions.id"), nullable=False, unique=True)
    
    response_text = Column(Text, nullable=True) # Transcribed text from audio
    audio_url = Column(String(512), nullable=True) # URL to the audio file in Cloud Storage
    video_url = Column(String(512), nullable=True) # URL to the video file in Cloud Storage
    
    processing_status = Column(Enum(ResponseStatus), nullable=False, default=ResponseStatus.pending)
    processing_error = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    screening_question = relationship("ScreeningQuestion", back_populates="candidate_response")
    evaluation = relationship("ResponseEvaluation", back_populates="candidate_response", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CandidateResponse(id={self.id}, question_id={self.screening_question_id}, status='{self.processing_status.value}')>"

class ResponseEvaluation(Base):
    __tablename__ = "response_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    candidate_response_id = Column(Integer, ForeignKey("candidate_responses.id"), nullable=False, unique=True)

    relevance_score = Column(Float, nullable=True) # 0-100, how relevant the answer was
    clarity_score = Column(Float, nullable=True) # 0-100, how clear the communication was
    sentiment_score = Column(Float, nullable=True) # -1 (negative) to 1 (positive)
    confidence_score = Column(Float, nullable=True) # 0-100, candidate's confidence
    
    keyword_matches = Column(ARRAY(String), nullable=True, default=[]) # Keywords matched from ideal answer
    ai_feedback = Column(Text, nullable=True) # Qualitative feedback from AI
    ai_generated = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    candidate_response = relationship("CandidateResponse", back_populates="evaluation")

    def __repr__(self):
        return f"<ResponseEvaluation(id={self.id}, response_id={self.candidate_response_id}, relevance={self.relevance_score})>"

# Add back-populates to CandidateProfile model (assumed to be in another file)
# This is a comment to remind us to update the other model file.
# In CandidateProfile (resume_scanner.py):
# interview_sessions = relationship("InterviewSession", back_populates="candidate_profile", cascade="all, delete-orphan")
