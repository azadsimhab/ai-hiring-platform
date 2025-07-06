from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Any, Dict
from datetime import datetime

from app.models.coding_test import ChallengeDifficulty, TestSessionStatus

# --- CodingChallenge Schemas ---

class TestCase(BaseModel):
    input: Any = Field(..., description="The input for the test case.")
    expected_output: Any = Field(..., description="The expected output for the test case.")
    is_hidden: bool = Field(False, description="Whether the test case is hidden from the candidate.")
    weight: float = Field(1.0, description="The weight of this test case in the overall score.")

class CodingChallengeBase(BaseModel):
    title: str = Field(..., max_length=255, description="The title of the coding challenge.")
    description: str = Field(..., description="A detailed description of the problem, including constraints and examples.")
    difficulty: ChallengeDifficulty = Field(ChallengeDifficulty.medium, description="The difficulty level of the challenge.")
    supported_languages: List[str] = Field(..., description="A list of supported programming languages.", example=["python", "javascript"])
    base_code_stubs: Optional[Dict[str, str]] = Field(None, description="A dictionary of base code stubs for each language.")
    test_cases: List[TestCase] = Field(..., description="A list of test cases to validate the solution.")

class CodingChallengeCreate(CodingChallengeBase):
    job_description_id: Optional[int] = Field(None, description="The ID of the job description this challenge is for.")
    ai_generated: bool = Field(False)
    generation_prompt: Optional[str] = None

class CodingChallengeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[ChallengeDifficulty] = None
    supported_languages: Optional[List[str]] = None
    base_code_stubs: Optional[Dict[str, str]] = None
    test_cases: Optional[List[TestCase]] = None

class CodingChallengeResponse(CodingChallengeBase):
    id: int
    job_description_id: Optional[int]
    ai_generated: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        use_enum_values = True

# --- CodingTestSession Schemas ---

class CodingTestSessionBase(BaseModel):
    candidate_profile_id: int
    job_description_id: int
    status: TestSessionStatus = Field(TestSessionStatus.scheduled)
    expires_at: datetime

class CodingTestSessionCreate(BaseModel):
    candidate_profile_id: int
    job_description_id: int
    challenge_ids: List[int] = Field(..., description="A list of challenge IDs to include in this test session.")
    duration_minutes: int = Field(60, description="The duration of the test session in minutes.")

class CodingTestSessionUpdate(BaseModel):
    status: Optional[TestSessionStatus] = None
    window_focus_changes: Optional[int] = None
    paste_count: Optional[int] = None
    overall_score: Optional[float] = None
    final_evaluation_summary: Optional[str] = None

class CodingTestSessionResponse(CodingTestSessionBase):
    id: int
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    overall_score: Optional[float] = None
    final_evaluation_summary: Optional[str] = None
    window_focus_changes: int
    paste_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        use_enum_values = True

# --- CandidateSubmission Schemas ---

class CandidateSubmissionBase(BaseModel):
    language: str = Field(..., description="The programming language of the submission.")
    code: str = Field(..., description="The candidate's code.")

class CandidateSubmissionCreate(CandidateSubmissionBase):
    test_session_id: int
    challenge_id: int

class ExecutionResult(BaseModel):
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    execution_time_ms: Optional[float] = None
    passed_tests: int
    total_tests: int
    results: List[Dict[str, Any]] # Detailed results for each test case

class CandidateSubmissionResponse(CandidateSubmissionBase):
    id: int
    test_session_id: int
    challenge_id: int
    execution_result: Optional[ExecutionResult] = None
    submitted_at: datetime

    class Config:
        orm_mode = True
        use_enum_values = True

# --- SubmissionEvaluation Schemas ---

class SubmissionEvaluationBase(BaseModel):
    correctness_score: Optional[float] = Field(None, ge=0, le=100)
    efficiency_score: Optional[float] = Field(None, ge=0, le=100)
    style_score: Optional[float] = Field(None, ge=0, le=100)
    readability_score: Optional[float] = Field(None, ge=0, le=100)
    plagiarism_score: Optional[float] = Field(None, ge=0, le=100)
    ai_feedback: Optional[str] = None
    ai_generated: bool = True

class SubmissionEvaluationCreate(SubmissionEvaluationBase):
    submission_id: int

class SubmissionEvaluationResponse(SubmissionEvaluationBase):
    id: int
    submission_id: int
    created_at: datetime

    class Config:
        orm_mode = True
        use_enum_values = True

# --- API-Specific Schemas ---

class GenerateChallengeRequest(BaseModel):
    job_description_id: int
    difficulty: ChallengeDifficulty = ChallengeDifficulty.medium
    language: str = "python"
    topic: Optional[str] = Field(None, description="A specific topic for the challenge, e.g., 'dynamic programming'.")

class StartTestSessionResponse(BaseModel):
    session: CodingTestSessionResponse
    challenges: List[CodingChallengeResponse]

class SubmitCodeRequest(BaseModel):
    session_id: int
    challenge_id: int
    language: str
    code: str

class SubmitCodeResponse(BaseModel):
    submission_id: int
    message: str = "Submission received and is being evaluated."
    execution_result: ExecutionResult

class AntiCheatEventRequest(BaseModel):
    session_id: int
    event_type: str = Field(..., description="Type of event, e.g., 'focus_change', 'paste'.")

class CodeSnapshotRequest(BaseModel):
    submission_id: int
    code: str

class FinalEvaluationResponse(BaseModel):
    session_id: int
    status: TestSessionStatus
    overall_score: Optional[float]
    final_evaluation_summary: Optional[str]
    plagiarism_concerns: Optional[List[str]] = None
    submissions: List[Dict[str, Any]]

class CodingTestSessionDetailResponse(CodingTestSessionResponse):
    """A comprehensive view of a test session, including all submissions and evaluations."""
    submissions: List[CandidateSubmissionResponse] = []

    class Config:
        orm_mode = True
        use_enum_values = True
