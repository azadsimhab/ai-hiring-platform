from fastapi import APIRouter, HTTPException, status
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Simple Pydantic models for testing
class JobDescriptionBase(BaseModel):
    title: str
    overview: str
    responsibilities: List[str] = []
    required_qualifications: List[str] = []
    preferred_qualifications: List[str] = []
    benefits: List[str] = []

class JobDescriptionCreate(JobDescriptionBase):
    hiring_request_id: int

class JobDescription(JobDescriptionBase):
    id: int
    status: str
    ai_generated: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Mock data for testing
job_descriptions_db = []

@router.get("/", response_model=List[JobDescription])
async def get_job_descriptions():
    """Get all job descriptions"""
    return job_descriptions_db

@router.get("/{jd_id}", response_model=JobDescription)
async def get_job_description(jd_id: int):
    """Get a specific job description by ID"""
    for jd in job_descriptions_db:
        if jd["id"] == jd_id:
            return jd
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Job description not found"
    )

@router.post("/", response_model=JobDescription, status_code=status.HTTP_201_CREATED)
async def create_job_description(jd: JobDescriptionCreate):
    """Create a new job description"""
    new_jd = {
        "id": len(job_descriptions_db) + 1,
        **jd.dict(),
        "status": "draft",
        "ai_generated": False,
        "created_at": datetime.now()
    }
    job_descriptions_db.append(new_jd)
    return new_jd

@router.post("/generate")
async def generate_job_description():
    """Generate a job description using AI"""
    return {
        "message": "Job description generation endpoint",
        "status": "AI generation not implemented yet"
    }
