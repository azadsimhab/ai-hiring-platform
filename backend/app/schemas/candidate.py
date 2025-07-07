from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Any
from datetime import datetime
from app.models.candidate import CandidateStatus, CandidateSource

class CandidateBase(BaseModel):
    first_name: str = Field(..., description="First name", example="John")
    last_name: str = Field(..., description="Last name", example="Doe")
    email: EmailStr = Field(..., description="Email address", example="john.doe@example.com")
    phone: Optional[str] = Field(None, description="Phone number", example="+1234567890")
    current_position: Optional[str] = Field(None, description="Current job title", example="Software Engineer")
    current_company: Optional[str] = Field(None, description="Current company", example="Tech Corp")
    years_of_experience: Optional[float] = Field(None, ge=0, description="Years of experience", example=5.5)
    source: Optional[CandidateSource] = Field(None, description="How the candidate was sourced")
    resume_url: Optional[str] = Field(None, description="URL to resume file")
    cover_letter_url: Optional[str] = Field(None, description="URL to cover letter")
    portfolio_url: Optional[str] = Field(None, description="Portfolio URL")
    linkedin_url: Optional[str] = Field(None, description="LinkedIn profile URL")
    expected_salary_min: Optional[float] = Field(None, ge=0, description="Minimum expected salary")
    expected_salary_max: Optional[float] = Field(None, ge=0, description="Maximum expected salary")
    salary_currency: str = Field("USD", description="Salary currency")
    available_start_date: Optional[datetime] = Field(None, description="Available start date")
    notice_period_days: Optional[int] = Field(None, ge=0, description="Notice period in days")
    preferred_work_type: Optional[str] = Field(None, description="Preferred work type", example="remote")
    preferred_location: Optional[str] = Field(None, description="Preferred location")
    tags: Optional[List[str]] = Field(None, description="Tags for categorization")
    notes: Optional[str] = Field(None, description="Internal notes")
    is_referral: bool = Field(False, description="Whether this is a referral")
    referred_by: Optional[str] = Field(None, description="Name of person who referred")

class CandidateCreate(CandidateBase):
    hiring_request_id: int = Field(..., description="ID of the hiring request")

class CandidateUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    current_position: Optional[str] = None
    current_company: Optional[str] = None
    years_of_experience: Optional[float] = None
    status: Optional[CandidateStatus] = None
    source: Optional[CandidateSource] = None
    resume_url: Optional[str] = None
    cover_letter_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    expected_salary_min: Optional[float] = None
    expected_salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    available_start_date: Optional[datetime] = None
    notice_period_days: Optional[int] = None
    preferred_work_type: Optional[str] = None
    preferred_location: Optional[str] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None
    is_referral: Optional[bool] = None
    referred_by: Optional[str] = None

class CandidateResponse(CandidateBase):
    id: int
    status: CandidateStatus
    hiring_request_id: int
    applied_date: datetime
    ai_skills_analysis: Optional[Any] = None
    ai_experience_analysis: Optional[Any] = None
    ai_cultural_fit_score: Optional[float] = None
    ai_overall_score: Optional[float] = None
    interview_notes: Optional[str] = None
    technical_test_score: Optional[float] = None
    reference_check_status: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CandidateListResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    status: CandidateStatus
    current_position: Optional[str] = None
    current_company: Optional[str] = None
    years_of_experience: Optional[float] = None
    applied_date: datetime
    ai_overall_score: Optional[float] = None
    
    class Config:
        from_attributes = True

class CandidateFilter(BaseModel):
    status: Optional[CandidateStatus] = None
    source: Optional[CandidateSource] = None
    hiring_request_id: Optional[int] = None
    search: Optional[str] = None
    min_experience: Optional[float] = None
    max_experience: Optional[float] = None
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0) 