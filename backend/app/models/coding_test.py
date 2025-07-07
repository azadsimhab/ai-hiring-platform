from sqlalchemy import Column, String, Text, Enum, Integer, ForeignKey, Float, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel
import enum

class CodingTestStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class CodingTestDifficulty(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"

class CodingTest(BaseModel):
    __tablename__ = "coding_tests"
    
    # Basic information
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(Enum(CodingTestDifficulty), default=CodingTestDifficulty.MEDIUM, nullable=False)
    status = Column(Enum(CodingTestStatus), default=CodingTestStatus.PENDING, nullable=False)
    
    # Test configuration
    time_limit_minutes = Column(Integer, default=60, nullable=False)
    max_attempts = Column(Integer, default=1, nullable=False)
    allow_google_search = Column(Boolean, default=False, nullable=False)
    allow_autocomplete = Column(Boolean, default=True, nullable=False)
    
    # Programming language and environment
    programming_language = Column(String(50), nullable=False)  # python, javascript, java, etc.
    framework = Column(String(100), nullable=True)  # react, django, spring, etc.
    test_environment = Column(String(100), nullable=True)  # node, python, java, etc.
    
    # Test content
    problem_statement = Column(Text, nullable=False)
    test_cases = Column(JSON, nullable=True)  # Array of test cases
    starter_code = Column(Text, nullable=True)
    solution_template = Column(Text, nullable=True)
    
    # AI-generated content
    ai_generated_problem = Column(Boolean, default=False, nullable=False)
    ai_difficulty_assessment = Column(Float, nullable=True)  # AI-assessed difficulty
    ai_skill_tags = Column(JSON, nullable=True)  # Skills this test evaluates
    
    # Anti-cheat features
    enable_screen_recording = Column(Boolean, default=False, nullable=False)
    enable_webcam_monitoring = Column(Boolean, default=False, nullable=False)
    enable_tab_switching_detection = Column(Boolean, default=True, nullable=False)
    enable_copy_paste_detection = Column(Boolean, default=True, nullable=False)
    
    # Scheduling
    assigned_at = Column(DateTime(timezone=True), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Results
    score = Column(Float, nullable=True)  # 0-100 score
    time_taken_minutes = Column(Integer, nullable=True)
    attempts_count = Column(Integer, default=0, nullable=False)
    
    # Code submission
    submitted_code = Column(Text, nullable=True)
    code_execution_time = Column(Float, nullable=True)  # in seconds
    memory_usage = Column(Float, nullable=True)  # in MB
    
    # Test case results
    test_case_results = Column(JSON, nullable=True)  # Results of each test case
    passed_test_cases = Column(Integer, default=0, nullable=False)
    total_test_cases = Column(Integer, default=0, nullable=False)
    
    # Anti-cheat flags
    suspicious_activity_detected = Column(Boolean, default=False, nullable=False)
    anti_cheat_flags = Column(JSON, nullable=True)  # Array of detected suspicious activities
    screen_recording_url = Column(String(500), nullable=True)
    
    # Feedback
    ai_feedback = Column(Text, nullable=True)  # AI-generated feedback
    code_quality_score = Column(Float, nullable=True)  # Code quality assessment
    readability_score = Column(Float, nullable=True)  # Code readability score
    efficiency_score = Column(Float, nullable=True)  # Algorithm efficiency score
    
    # Relationships
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    candidate = relationship("Candidate", back_populates="coding_tests")
    
    hiring_request_id = Column(Integer, ForeignKey("hiring_requests.id"), nullable=True)
    
    @property
    def is_completed(self):
        return self.status == CodingTestStatus.COMPLETED
    
    @property
    def is_expired(self):
        if self.due_date is not None:
            from datetime import datetime
            return datetime.utcnow() > self.due_date
        return False
    
    @property
    def test_case_pass_rate(self):
        # This property should be calculated in the application layer
        # when the actual values are available, not as a SQLAlchemy property
        return 0.0
    
    @property
    def time_remaining_minutes(self):
        # This property should be calculated in the application layer
        # when the actual values are available, not as a SQLAlchemy property
        return None
