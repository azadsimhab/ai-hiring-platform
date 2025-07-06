from sqlalchemy import (
    Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float,
    Enum, JSON
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base_class import Base

# Define Enums for status and difficulty fields
class ChallengeDifficulty(enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class TestSessionStatus(enum.Enum):
    scheduled = "scheduled"
    started = "started"
    completed = "completed"
    expired = "expired"


class CodingChallenge(Base):
    """
    Represents a coding challenge/problem in the system.
    Can be generic or tied to a specific job description.
    """
    __tablename__ = "coding_challenges"

    id = Column(Integer, primary_key=True, index=True)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(Enum(ChallengeDifficulty), nullable=False, default=ChallengeDifficulty.medium)
    
    supported_languages = Column(ARRAY(String), nullable=False, default=["python", "javascript"])
    base_code_stubs = Column(JSON, nullable=True)  # e.g., {"python": "def solve():\n  pass", "javascript": "function solve() {\n\n}"}
    test_cases = Column(JSON, nullable=False) # e.g., [{"input": [1, 2], "expected_output": 3, "is_hidden": false}]

    ai_generated = Column(Boolean, default=False)
    generation_prompt = Column(Text, nullable=True) # The prompt used to generate this challenge

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    job_description = relationship("JobDescription") # A challenge can be linked to a JD
    submissions = relationship("CandidateSubmission", back_populates="challenge")

    def __repr__(self):
        return f"<CodingChallenge(id={self.id}, title='{self.title}', difficulty='{self.difficulty.value}')>"


class CodingTestSession(Base):
    """
    Represents a single candidate's attempt at a coding test.
    Contains anti-cheating metadata.
    """
    __tablename__ = "coding_test_sessions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_profile_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False, index=True)
    job_description_id = Column(Integer, ForeignKey("job_descriptions.id"), nullable=False, index=True)

    status = Column(Enum(TestSessionStatus), nullable=False, default=TestSessionStatus.scheduled)
    
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    overall_score = Column(Float, nullable=True) # Aggregated score from all submissions
    final_evaluation_summary = Column(Text, nullable=True) # AI-generated summary of the entire test performance

    # Anti-cheating fields
    ip_address = Column(String(45), nullable=True) # Supports IPv6
    user_agent = Column(Text, nullable=True)
    window_focus_changes = Column(Integer, default=0) # Counter for how many times the candidate leaves the test window
    paste_count = Column(Integer, default=0) # Counter for paste events

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    candidate_profile = relationship("CandidateProfile") # The candidate taking the test
    job_description = relationship("JobDescription") # The job this test is for
    submissions = relationship("CandidateSubmission", back_populates="test_session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CodingTestSession(id={self.id}, candidate_id={self.candidate_profile_id}, status='{self.status.value}')>"


class CandidateSubmission(Base):
    """
    Represents a candidate's code submission for a single challenge within a test session.
    """
    __tablename__ = "candidate_submissions"

    id = Column(Integer, primary_key=True, index=True)
    test_session_id = Column(Integer, ForeignKey("coding_test_sessions.id"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("coding_challenges.id"), nullable=False)

    language = Column(String(50), nullable=False)
    code = Column(Text, nullable=False)
    
    # Result from the code execution sandbox
    execution_result = Column(JSON, nullable=True) # e.g., {"stdout": "...", "stderr": "...", "execution_time_ms": 120, "passed_tests": 5, "total_tests": 10}
    
    # Anti-cheating: periodic snapshots of the code
    code_snapshots = Column(JSONB, nullable=True) # e.g., [{"timestamp": "...", "code": "..."}]

    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    test_session = relationship("CodingTestSession", back_populates="submissions")
    challenge = relationship("CodingChallenge", back_populates="submissions")
    evaluation = relationship("SubmissionEvaluation", back_populates="submission", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CandidateSubmission(id={self.id}, session_id={self.test_session_id}, challenge_id={self.challenge_id})>"


class SubmissionEvaluation(Base):
    """
    Represents the AI's detailed evaluation of a single code submission.
    """
    __tablename__ = "submission_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("candidate_submissions.id"), nullable=False, unique=True)

    correctness_score = Column(Float, nullable=True) # Based on test cases
    efficiency_score = Column(Float, nullable=True) # Based on time/space complexity analysis
    style_score = Column(Float, nullable=True) # Based on linting rules and conventions
    readability_score = Column(Float, nullable=True) # Based on code clarity and comments
    plagiarism_score = Column(Float, nullable=True) # Anti-cheating: similarity score against a corpus

    ai_feedback = Column(Text, nullable=True) # Qualitative feedback from the AI
    ai_generated = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    submission = relationship("CandidateSubmission", back_populates="evaluation")

    def __repr__(self):
        return f"<SubmissionEvaluation(id={self.id}, submission_id={self.submission_id}, correctness={self.correctness_score})>"

# Reminder: Add back-populating relationships to other models.
# In `JobDescription` (jd_generator.py):
# coding_challenges = relationship("CodingChallenge", back_populates="job_description", cascade="all, delete-orphan")
# coding_test_sessions = relationship("CodingTestSession", back_populates="job_description", cascade="all, delete-orphan")

# In `CandidateProfile` (resume_scanner.py):
# coding_test_sessions = relationship("CodingTestSession", back_populates="candidate_profile", cascade="all, delete-orphan")
