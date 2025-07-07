from pydantic import BaseModel, Field, validator
from typing import List, Optional, Any
from datetime import datetime
from app.models.interview import InterviewType, InterviewStatus

class InterviewBase(BaseModel):
    title: str = Field(..., description="Interview title", example="Technical Interview")
    description: Optional[str] = Field(None, description="Interview description")
    interview_type: InterviewType = Field(..., description="Type of interview")
    scheduled_at: datetime = Field(..., description="Scheduled interview time")
    duration_minutes: int = Field(60, ge=15, le=480, description="Interview duration in minutes")
    timezone: str = Field("UTC", description="Timezone for the interview")
    meeting_url: Optional[str] = Field(None, description="Meeting URL")
    meeting_id: Optional[str] = Field(None, description="Meeting ID")
    meeting_password: Optional[str] = Field(None, description="Meeting password")

class InterviewCreate(InterviewBase):
    interviewer_id: int = Field(..., description="ID of the interviewer")
    candidate_id: int = Field(..., description="ID of the candidate")
    hiring_request_id: int = Field(..., description="ID of the hiring request")

class InterviewUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    interview_type: Optional[InterviewType] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    timezone: Optional[str] = None
    status: Optional[InterviewStatus] = None
    meeting_url: Optional[str] = None
    meeting_id: Optional[str] = None
    meeting_password: Optional[str] = None
    interviewer_id: Optional[int] = None

class InterviewResponse(InterviewBase):
    id: int
    status: InterviewStatus
    interviewer_id: int
    candidate_id: int
    hiring_request_id: int
    ai_questions: Optional[List[Any]] = None
    ai_analysis: Optional[Any] = None
    ai_score: Optional[float] = None
    notes: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    overall_rating: Optional[float] = None
    recommendation: Optional[str] = None
    technical_skills_rating: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class InterviewListResponse(BaseModel):
    id: int
    title: str
    interview_type: InterviewType
    status: InterviewStatus
    scheduled_at: datetime
    interviewer_id: int
    candidate_id: int
    hiring_request_id: int
    
    class Config:
        from_attributes = True

class InterviewFilter(BaseModel):
    status: Optional[InterviewStatus] = None
    interview_type: Optional[InterviewType] = None
    interviewer_id: Optional[int] = None
    candidate_id: Optional[int] = None
    hiring_request_id: Optional[int] = None
    scheduled_after: Optional[datetime] = None
    scheduled_before: Optional[datetime] = None
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0) 