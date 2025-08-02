from fastapi import APIRouter, HTTPException, status, UploadFile, File
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Simple Pydantic models for testing
class ResumeBase(BaseModel):
    file_name: str
    file_type: str

class ResumeResponse(ResumeBase):
    id: int
    processing_status: str
    ai_processed: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    experience_years: float
    skills: List[str] = []

# Mock data for testing
resumes_db = []
candidates_db = []

@router.get("/")
async def resume_scanner_root():
    return {"message": "Resume Scanner API root"}

@router.get("/resumes", response_model=List[ResumeResponse])
async def get_resumes():
    """Get all resumes"""
    return resumes_db

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(file: UploadFile = File(...)):
    """Upload a resume file"""
    new_resume = {
        "id": len(resumes_db) + 1,
        "file_name": file.filename,
        "file_type": file.content_type or "unknown",
        "processing_status": "pending",
        "ai_processed": False,
        "created_at": datetime.now()
    }
    resumes_db.append(new_resume)
    return new_resume

@router.get("/candidates", response_model=List[CandidateProfileResponse])
async def get_candidates():
    """Get all candidate profiles"""
    return candidates_db

@router.post("/analyze/{resume_id}")
async def analyze_resume(resume_id: int):
    """Analyze a resume using AI"""
    return {
        "message": "Resume analysis endpoint",
        "resume_id": resume_id,
        "status": "AI analysis not implemented yet"
    }
