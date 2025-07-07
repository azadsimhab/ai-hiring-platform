from sqlalchemy import Column, String, Text, Enum, Integer, ForeignKey, Float, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel
import enum

class CandidateStatus(str, enum.Enum):
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEWED = "interviewed"
    TECHNICAL_TEST = "technical_test"
    REFERENCE_CHECK = "reference_check"
    OFFER_MADE = "offer_made"
    HIRED = "hired"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class CandidateSource(str, enum.Enum):
    JOB_BOARD = "job_board"
    REFERRAL = "referral"
    LINKEDIN = "linkedin"
    INDEED = "indeed"
    COMPANY_WEBSITE = "company_website"
    RECRUITER = "recruiter"
    OTHER = "other"

class Candidate(BaseModel):
    __tablename__ = "candidates"
    
    # Basic information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    
    # Professional information
    current_position = Column(String(100), nullable=True)
    current_company = Column(String(100), nullable=True)
    years_of_experience = Column(Float, nullable=True)
    
    # Application details
    status = Column(Enum(CandidateStatus), default=CandidateStatus.APPLIED, nullable=False)
    source = Column(Enum(CandidateSource), nullable=True)
    applied_date = Column(DateTime(timezone=True), nullable=False)
    
    # Resume and documents
    resume_url = Column(String(500), nullable=True)
    cover_letter_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    
    # AI Analysis results
    ai_skills_analysis = Column(JSON, nullable=True)  # Extracted skills and scores
    ai_experience_analysis = Column(JSON, nullable=True)  # Experience analysis
    ai_cultural_fit_score = Column(Float, nullable=True)  # 0-100 score
    ai_overall_score = Column(Float, nullable=True)  # 0-100 overall score
    
    # Interview and assessment
    interview_notes = Column(Text, nullable=True)
    technical_test_score = Column(Float, nullable=True)
    reference_check_status = Column(String(50), nullable=True)
    
    # Salary expectations
    expected_salary_min = Column(Float, nullable=True)
    expected_salary_max = Column(Float, nullable=True)
    salary_currency = Column(String(3), default="USD", nullable=False)
    
    # Availability
    available_start_date = Column(DateTime(timezone=True), nullable=True)
    notice_period_days = Column(Integer, nullable=True)
    
    # Preferences
    preferred_work_type = Column(String(50), nullable=True)  # remote, hybrid, on-site
    preferred_location = Column(String(100), nullable=True)
    
    # Metadata
    tags = Column(JSON, nullable=True)  # Custom tags
    notes = Column(Text, nullable=True)  # Internal notes
    is_referral = Column(Boolean, default=False, nullable=False)
    referred_by = Column(String(100), nullable=True)
    
    # Relationships
    hiring_request_id = Column(Integer, ForeignKey("hiring_requests.id"), nullable=False)
    hiring_request = relationship("HiringRequest", back_populates="candidates")
    
    # Interviews
    interviews = relationship("Interview", back_populates="candidate")
    
    # Coding tests
    coding_tests = relationship("CodingTest", back_populates="candidate")
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_active(self):
        return self.status not in [
            CandidateStatus.REJECTED,
            CandidateStatus.WITHDRAWN,
            CandidateStatus.HIRED
        ]
    
    @property
    def days_since_applied(self):
        if self.applied_date:
            from datetime import datetime
            return (datetime.utcnow() - self.applied_date).days
        return None