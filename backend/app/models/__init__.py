# Import all models to ensure they are registered with SQLAlchemy
from .base import Base, BaseModel
from .user import User, UserRole, UserStatus
from .hiring_request import HiringRequest, HiringRequestStatus, HiringRequestPriority
from .candidate import Candidate, CandidateStatus, CandidateSource
from .interview import Interview, InterviewType, InterviewStatus
from .coding_test import CodingTest, CodingTestStatus, CodingTestDifficulty
from .jd_generator import JobDescription, InterviewQuestion
from .resume_scanner import Resume, CandidateProfile, SkillEvaluation, ResumeEvaluation
from .multimodal_screening import InterviewSession, InterviewQuestionResponse

# Export all models and enums
__all__ = [
    "Base",
    "BaseModel",
    "User",
    "UserRole", 
    "UserStatus",
    "HiringRequest",
    "HiringRequestStatus",
    "HiringRequestPriority",
    "Candidate",
    "CandidateStatus",
    "CandidateSource",
    "Interview",
    "InterviewType",
    "InterviewStatus",
    "CodingTest",
    "CodingTestStatus",
    "CodingTestDifficulty",
    "JobDescription",
    "InterviewQuestion",
    "Resume",
    "CandidateProfile",
    "SkillEvaluation",
    "ResumeEvaluation",
    "InterviewSession",
    "InterviewQuestionResponse"
] 