from fastapi import APIRouter, HTTPException, status
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Simple Pydantic models for testing
class CodingChallengeBase(BaseModel):
    title: str
    description: str
    difficulty: str
    language: str

class CodingChallenge(CodingChallengeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TestSessionBase(BaseModel):
    candidate_id: int
    challenge_id: int

class TestSession(TestSessionBase):
    id: int
    status: str
    started_at: datetime

    class Config:
        from_attributes = True

# Mock data for testing
challenges_db = []
sessions_db = []

@router.get("/challenges", response_model=List[CodingChallenge])
async def get_coding_challenges():
    """Get all coding challenges"""
    return challenges_db

@router.post("/challenges", response_model=CodingChallenge, status_code=status.HTTP_201_CREATED)
async def create_coding_challenge(challenge: CodingChallengeBase):
    """Create a new coding challenge"""
    new_challenge = {
        "id": len(challenges_db) + 1,
        **challenge.dict(),
        "created_at": datetime.now()
    }
    challenges_db.append(new_challenge)
    return new_challenge

@router.post("/sessions", response_model=TestSession, status_code=status.HTTP_201_CREATED)
async def create_test_session(session: TestSessionBase):
    """Create a new coding test session"""
    new_session = {
        "id": len(sessions_db) + 1,
        **session.dict(),
        "status": "pending",
        "started_at": datetime.now()
    }
    sessions_db.append(new_session)
    return new_session

@router.post("/sessions/{session_id}/submit")
async def submit_code(session_id: int, code: str):
    """Submit code for evaluation"""
    return {
        "message": "Code submitted for evaluation",
        "session_id": session_id,
        "status": "AI evaluation not implemented yet"
    }

@router.get("/test")
async def test_coding():
    """Test endpoint for coding test"""
    return {"message": "Coding test routes are working!"}
