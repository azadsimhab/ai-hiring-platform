from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import BaseModel

class InterviewSession(BaseModel):
    __tablename__ = "interview_sessions"
    
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    interviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_type = Column(String(50), nullable=False)  # video, audio, text
    status = Column(String(50), nullable=False, default="scheduled")  # scheduled, in_progress, completed, cancelled
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    ai_analysis_score = Column(Integer, nullable=True)  # 0-100
    ai_feedback = Column(Text, nullable=True)
    technical_score = Column(Integer, nullable=True)  # 0-100
    communication_score = Column(Integer, nullable=True)  # 0-100
    cultural_fit_score = Column(Integer, nullable=True)  # 0-100
    overall_score = Column(Integer, nullable=True)  # 0-100
    decision = Column(String(50), nullable=True)  # hire, reject, maybe
    notes = Column(Text, nullable=True)
    
    # Relationships
    candidate = relationship("Candidate", back_populates="interview_sessions")
    job_description = relationship("JobDescription", back_populates="interview_sessions")
    interviewer = relationship("User", back_populates="interview_sessions")
    questions = relationship("InterviewQuestionResponse", back_populates="session", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<InterviewSession(id={self.id}, candidate_id={self.candidate_id}, status='{self.status}')>"


class InterviewQuestionResponse(BaseModel):
    __tablename__ = "interview_question_responses"
    
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("interview_questions.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    response_text = Column(Text, nullable=True)
    response_audio_url = Column(String(500), nullable=True)
    response_video_url = Column(String(500), nullable=True)
    ai_analysis = Column(JSON, nullable=True)
    score = Column(Integer, nullable=True)  # 0-100
    feedback = Column(Text, nullable=True)
    
    # Relationships
    session = relationship("InterviewSession", back_populates="questions")
    question = relationship("InterviewQuestion")
    
    def __repr__(self):
        return f"<InterviewQuestionResponse(id={self.id}, session_id={self.session_id}, score={self.score})>"
