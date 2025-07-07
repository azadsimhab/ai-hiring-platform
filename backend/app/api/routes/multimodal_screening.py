from fastapi import APIRouter, HTTPException, status
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Simple Pydantic models for testing
class InterviewSessionBase(BaseModel):
    candidate_id: int
    job_description_id: int

class InterviewSession(InterviewSessionBase):
    id: int
    status: str
    session_type: str
    created_at: datetime

    class Config:
        from_attributes = True

# Mock data for testing
sessions_db = []

@router.get("/sessions", response_model=List[InterviewSession])
async def get_interview_sessions():
    """Get all interview sessions"""
    return sessions_db

@router.post("/sessions", response_model=InterviewSession, status_code=status.HTTP_201_CREATED)
async def create_interview_session(session: InterviewSessionBase):
    """Create a new interview session"""
    new_session = {
        "id": len(sessions_db) + 1,
        **session.dict(),
        "status": "scheduled",
        "session_type": "ai_only",
        "created_at": datetime.now()
    }
    sessions_db.append(new_session)
    return new_session

@router.post("/sessions/{session_id}/start")
async def start_interview_session(session_id: int):
    """Start an interview session"""
    return {
        "message": "Interview session started",
        "session_id": session_id,
        "status": "AI interview not implemented yet"
    }

@router.get("/test")
async def test_multimodal():
    """Test endpoint for multimodal screening"""
    return {"message": "Multimodal screening routes are working!"}
