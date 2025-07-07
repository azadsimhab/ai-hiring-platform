"""
Hiring Request Schemas
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class HiringRequestStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class HiringRequestPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class HiringRequestCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10)
    department: str = Field(..., min_length=1, max_length=100)
    position: str = Field(..., min_length=1, max_length=100)
    priority: Optional[HiringRequestPriority] = HiringRequestPriority.MEDIUM
    budget_range: Optional[str] = Field(None, max_length=100)
    timeline_weeks: Optional[int] = Field(None, ge=1, le=52)
    required_skills: Optional[List[str]] = []
    preferred_skills: Optional[List[str]] = []

class HiringRequestUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    department: Optional[str] = Field(None, min_length=1, max_length=100)
    position: Optional[str] = Field(None, min_length=1, max_length=100)
    priority: Optional[HiringRequestPriority] = None
    status: Optional[HiringRequestStatus] = None
    budget_range: Optional[str] = Field(None, max_length=100)
    timeline_weeks: Optional[int] = Field(None, ge=1, le=52)
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None

class HiringRequestResponse(BaseModel):
    id: int
    title: str
    description: str
    department: str
    position: str
    status: str
    priority: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class HiringRequestApproval(BaseModel):
    notes: Optional[str] = Field(None, max_length=500)

class HiringRequestListResponse(BaseModel):
    items: List[HiringRequestResponse]
    total: int
    page: int
    size: int
    pages: int 