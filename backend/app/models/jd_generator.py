from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .base import Base

class JobDescription(Base):
    __tablename__ = "job_descriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    hiring_request_id = Column(Integer, ForeignKey("hiring_requests.id"), nullable=True)
    title = Column(String(255), nullable=False)
    overview = Column(Text, nullable=False)
    responsibilities = Column(ARRAY(Text), nullable=False, default=[])
    required_qualifications = Column(ARRAY(Text), nullable=False, default=[])
    preferred_qualifications = Column(ARRAY(Text), nullable=False, default=[])
    benefits = Column(ARRAY(Text), nullable=False, default=[])
    equal_opportunity_statement = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="draft")  # draft, published, archived
    ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    hiring_request = relationship("HiringRequest", back_populates="job_descriptions")
    interview_questions = relationship("InterviewQuestion", back_populates="job_description", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="job_description", cascade="all, delete-orphan")
    # Coding module relationships
    coding_challenges = relationship(
        "CodingChallenge",
        back_populates="job_description",
        cascade="all, delete-orphan",
    )
    coding_test_sessions = relationship(
        "CodingTestSession",
        back_populates="job_description",
        cascade="all, delete-orphan",
    )
    
    def __repr__(self):
        return f"<JobDescription(id={self.id}, title='{self.title}', status='{self.status}')>"


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False)
    question = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # behavioral, technical, situational
    difficulty = Column(String(20), nullable=False)  # easy, medium, hard
    purpose = Column(Text, nullable=True)
    ideal_answer_points = Column(ARRAY(Text), nullable=False, default=[])
    ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    job_description = relationship("JobDescription", back_populates="interview_questions")
    
    def __repr__(self):
        return f"<InterviewQuestion(id={self.id}, type='{self.type}', difficulty='{self.difficulty}')>"
