"""
AI Service Schemas for request/response validation
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ResumeAnalysisRequest(BaseModel):
    content: str = Field(..., description="Resume content to analyze")
    job_requirements: Optional[str] = Field(None, description="Job requirements for matching")
    analysis_type: str = Field(default="comprehensive", description="Type of analysis to perform")

class ResumeAnalysisResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None

class JobDescriptionRequest(BaseModel):
    hiring_request: Dict[str, Any] = Field(..., description="Hiring request data")
    style: str = Field(default="professional", description="Writing style for JD")
    include_ai_suggestions: bool = Field(default=True, description="Include AI suggestions")

class JobDescriptionResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None

class CodingTestRequest(BaseModel):
    code: str = Field(..., description="Code to evaluate")
    test_cases: List[Dict[str, Any]] = Field(..., description="Test cases to run")
    language: str = Field(..., description="Programming language")
    evaluation_criteria: List[str] = Field(default=["correctness", "efficiency", "readability"])

class CodingTestResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None

class InterviewAnalysisRequest(BaseModel):
    audio_url: Optional[str] = Field(None, description="Audio file URL")
    video_url: Optional[str] = Field(None, description="Video file URL")
    transcript: Optional[str] = Field(None, description="Interview transcript")
    analysis_type: str = Field(default="multimodal", description="Analysis type")

class InterviewAnalysisResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None

class SpeechToTextRequest(BaseModel):
    audio_data: str = Field(..., description="Base64 encoded audio data")
    language: str = Field(default="en-US", description="Audio language")

class TextToSpeechRequest(BaseModel):
    text: str = Field(..., description="Text to convert to speech")
    voice: str = Field(default="en-US-Standard-A", description="Voice to use")
    audio_config: Dict[str, Any] = Field(default_factory=dict)

class CandidateMatchRequest(BaseModel):
    candidate_profile: Dict[str, Any] = Field(..., description="Candidate profile")
    job_requirements: Dict[str, Any] = Field(..., description="Job requirements")
    matching_criteria: List[str] = Field(default=["skills", "experience", "culture_fit"])

class QuestionGenerationRequest(BaseModel):
    context: str = Field(..., description="Context for question generation")
    question_type: str = Field(..., description="Type of questions to generate")
    count: int = Field(default=5, description="Number of questions to generate")
    difficulty_level: str = Field(default="adaptive", description="Difficulty level")

class SentimentAnalysisRequest(BaseModel):
    text: str = Field(..., description="Text to analyze")
    analysis_type: str = Field(default="detailed", description="Analysis type")

class BatchAnalysisRequest(BaseModel):
    resumes: List[str] = Field(..., description="List of resume contents")
    parallel_processing: bool = Field(default=True, description="Enable parallel processing")
    batch_size: int = Field(default=10, description="Batch size for processing") 