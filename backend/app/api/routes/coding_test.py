from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import logging
import json
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.coding_test import (
    CodingChallenge, CodingTestSession, CandidateSubmission, SubmissionEvaluation,
    ChallengeDifficulty, TestSessionStatus
)
from app.models.jd_generator import JobDescription
from app.models.resume_scanner import CandidateProfile
from app.schemas.coding_test import (
    CodingChallengeCreate, CodingChallengeUpdate, CodingChallengeResponse,
    CodingTestSessionCreate, CodingTestSessionUpdate, CodingTestSessionResponse,
    CandidateSubmissionCreate, CandidateSubmissionResponse,
    SubmissionEvaluationCreate, SubmissionEvaluationResponse,
    GenerateChallengeRequest, StartTestSessionResponse, SubmitCodeRequest,
    SubmitCodeResponse, AntiCheatEventRequest, FinalEvaluationResponse,
    ExecutionResult
)
from app.core.config import settings
from app.services.ai_service import get_gemini_client

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Background Task Helper Functions ---

async def execute_code_in_sandbox(code: str, language: str, test_cases: List[Dict]) -> Dict:
    """
    Simulates executing code in a secure sandbox.
    In a real-world scenario, this would call an external service (e.g., Judge0, Firecracker).
    This simulation will perform a very basic check.
    """
    logger.info(f"Simulating code execution for language: {language}")
    # This is a placeholder for a real code execution engine.
    # We'll just simulate a few results for demonstration.
    passed_tests = 0
    total_tests = len(test_cases)
    results = []

    # A very simple "correctness" check for simulation purposes
    is_correct_solution = "return" in code and "+" in code # Trivial check for an 'add' function

    for i, case in enumerate(test_cases):
        is_passed = is_correct_solution and not case.get("is_hidden", False)
        if is_passed:
            passed_tests += 1
        results.append({
            "test_case": i + 1,
            "passed": is_passed,
            "input": case.get("input"),
            "expected": case.get("expected_output"),
            "actual": "simulated_correct_output" if is_passed else "simulated_wrong_output"
        })

    return {
        "stdout": "Simulated output from code execution.",
        "stderr": "" if passed_tests == total_tests else "Simulated error on hidden test cases.",
        "execution_time_ms": 50.0,
        "passed_tests": passed_tests,
        "total_tests": total_tests,
        "results": results
    }

async def evaluate_submission_with_ai(submission_id: int, db: Session):
    """
    Uses Gemini AI to evaluate a code submission for quality, style, and efficiency.
    """
    submission = db.query(CandidateSubmission).filter(CandidateSubmission.id == submission_id).first()
    if not submission:
        logger.error(f"Submission {submission_id} not found for AI evaluation.")
        return

    challenge = submission.challenge
    prompt = f"""
    You are an expert code reviewer for a top tech company. Analyze the following code submission for a coding challenge.

    **Challenge Description:**
    {challenge.description}

    **Programming Language:**
    {submission.language}

    **Candidate's Code:**
    ```
    {submission.code}
    ```

    **Execution Results:**
    {json.dumps(submission.execution_result, indent=2)}

    Please provide a detailed evaluation in a valid JSON format. The evaluation should cover:
    1.  **correctness_score** (0-100): Based on the execution results. If all tests passed, this should be high.
    2.  **efficiency_score** (0-100): Analyze the time and space complexity. Is the solution optimal?
    3.  **style_score** (0-100): Assess the code style, adherence to language conventions, and use of best practices.
    4.  **readability_score** (0-100): How easy is the code to understand? Consider variable names, comments, and structure.
    5.  **plagiarism_score** (0-100): Provide a *simulated* score based on how generic or unique the solution appears. A low score is good.
    6.  **ai_feedback**: A comprehensive, constructive feedback paragraph summarizing the submission's strengths and weaknesses.

    **JSON Output format:**
    {{
        "correctness_score": 90,
        "efficiency_score": 75,
        "style_score": 85,
        "readability_score": 80,
        "plagiarism_score": 10,
        "ai_feedback": "The solution correctly passes most test cases. The approach is valid but could be optimized for time complexity... The code is well-structured and readable."
    }}
    """
    try:
        gemini = get_gemini_client()
        response = await gemini.generate_content(prompt)
        response_text = response.text

        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        json_str = response_text[start_idx:end_idx]
        eval_data = json.loads(json_str)

        evaluation = SubmissionEvaluation(submission_id=submission_id, **eval_data)
        db.add(evaluation)
        db.commit()
        logger.info(f"Successfully generated AI evaluation for submission {submission_id}")
    except Exception as e:
        logger.error(f"Failed to generate AI evaluation for submission {submission_id}: {str(e)}")

async def generate_final_test_summary(session_id: int, db: Session):
    """
    Generates a final summary for the entire test session after it has ended.
    """
    session = db.query(CodingTestSession).filter(CodingTestSession.id == session_id).first()
    if not session:
        logger.error(f"Test session {session_id} not found for final summary.")
        return

    submission_evaluations = []
    for sub in session.submissions:
        if sub.evaluation:
            submission_evaluations.append({
                "challenge": sub.challenge.title,
                "correctness": sub.evaluation.correctness_score,
                "efficiency": sub.evaluation.efficiency_score,
                "style": sub.evaluation.style_score,
                "feedback": sub.evaluation.ai_feedback
            })

    prompt = f"""
    You are a senior engineering manager reviewing a candidate's coding test results.

    **Candidate Test Session Overview:**
    - Window Focus Changes: {session.window_focus_changes}
    - Paste Events: {session.paste_count}

    **Individual Challenge Evaluations:**
    {json.dumps(submission_evaluations, indent=2)}

    Based on this data, provide a final summary. Calculate an `overall_score` (0-100) and write a `final_evaluation_summary`.
    Also, note any `plagiarism_concerns` based on the anti-cheating metrics.

    **JSON Output format:**
    {{
        "overall_score": 82.5,
        "final_evaluation_summary": "The candidate demonstrates strong problem-solving skills, particularly in algorithms. While their solutions were generally correct, there's room for improvement in optimizing for edge cases. The high number of window focus changes is a minor concern that may warrant a follow-up question.",
        "plagiarism_concerns": ["High number of window focus changes (15) could indicate external resource usage."]
    }}
    """
    try:
        gemini = get_gemini_client()
        response = await gemini.generate_content(prompt)
        response_text = response.text

        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        json_str = response_text[start_idx:end_idx]
        summary_data = json.loads(json_str)

        session.overall_score = summary_data.get("overall_score")
        session.final_evaluation_summary = summary_data.get("final_evaluation_summary")
        # You could store plagiarism concerns in a separate field if the model had one.
        db.commit()
        logger.info(f"Successfully generated final test summary for session {session_id}")
    except Exception as e:
        logger.error(f"Failed to generate final test summary for session {session_id}: {str(e)}")


# --- API Routes ---

# --- Challenge Management ---
@router.post("/challenges/generate", response_model=CodingChallengeResponse, status_code=status.HTTP_201_CREATED)
async def generate_challenge_with_ai(
    request: GenerateChallengeRequest,
    db: Session = Depends(get_db)
):
    """
    Generates a new coding challenge using AI based on job requirements.
    """
    job_desc = db.query(JobDescription).filter(JobDescription.id == request.job_description_id).first()
    if not job_desc:
        raise HTTPException(status_code=404, detail="Job description not found")

    prompt = f"""
    You are an expert in creating coding challenges for technical interviews.
    Generate a coding challenge for a '{job_desc.title}' position.

    **Difficulty:** {request.difficulty.value}
    **Primary Language:** {request.language}
    **Topic Focus:** {request.topic or 'General problem-solving'}

    Please provide a complete challenge in a valid JSON format. The JSON should include:
    1.  `title`: A concise, descriptive title.
    2.  `description`: A detailed problem description with examples, inputs, outputs, and constraints.
    3.  `supported_languages`: A list containing at least "python" and "javascript".
    4.  `base_code_stubs`: A dictionary with starter code for each supported language.
    5.  `test_cases`: An array of at least 5 test cases, including edge cases. Each test case must have `input`, `expected_output`, and `is_hidden` fields. At least 2 should be hidden.

    **JSON Output Example:**
    {{
        "title": "Efficient Array Pair Sum",
        "description": "Given an array of integers `nums` and a target integer `k`, find the number of pairs of elements in the array that sum up to `k`...",
        "supported_languages": ["python", "javascript"],
        "base_code_stubs": {{
            "python": "def find_pairs(nums, k):\\n  # Your code here\\n  pass",
            "javascript": "function findPairs(nums, k) {{\\n  // Your code here\\n}}"
        }},
        "test_cases": [
            {{"input": [[1, 2, 3, 4, 5], 6], "expected_output": 2, "is_hidden": false}},
            {{"input": [[1, 1, 1, 1], 2], "expected_output": 6, "is_hidden": false}},
            {{"input": [[], 5], "expected_output": 0, "is_hidden": true}}
        ]
    }}
    """
    try:
        gemini = get_gemini_client()
        response = await gemini.generate_content(prompt)
        response_text = response.text

        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        json_str = response_text[start_idx:end_idx]
        challenge_data = json.loads(json_str)

        challenge = CodingChallenge(
            job_description_id=request.job_description_id,
            difficulty=request.difficulty,
            ai_generated=True,
            generation_prompt=prompt,
            **challenge_data
        )
        db.add(challenge)
        db.commit()
        db.refresh(challenge)
        return challenge
    except Exception as e:
        logger.error(f"Failed to generate AI challenge: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate challenge from AI.")

@router.get("/challenges", response_model=List[CodingChallengeResponse])
def list_challenges(
    difficulty: Optional[ChallengeDifficulty] = None,
    job_description_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Lists all available coding challenges with optional filters."""
    query = db.query(CodingChallenge)
    if difficulty:
        query = query.filter(CodingChallenge.difficulty == difficulty)
    if job_description_id:
        query = query.filter(CodingChallenge.job_description_id == job_description_id)
    return query.all()

# --- Test Session Management ---
@router.post("/sessions/create", response_model=CodingTestSessionResponse, status_code=status.HTTP_201_CREATED)
def create_test_session(request: CodingTestSessionCreate, db: Session = Depends(get_db)):
    """Creates a new coding test session for a candidate."""
    # Validate that candidate and job description exist
    if not db.query(CandidateProfile).filter(CandidateProfile.id == request.candidate_profile_id).first():
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    if not db.query(JobDescription).filter(JobDescription.id == request.job_description_id).first():
        raise HTTPException(status_code=404, detail="Job description not found")

    expires_at = datetime.utcnow() + timedelta(days=7) # Default 7-day link validity
    session = CodingTestSession(
        candidate_profile_id=request.candidate_profile_id,
        job_description_id=request.job_description_id,
        expires_at=expires_at
        # The session is linked to challenges via submissions, not directly here.
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.post("/sessions/{session_id}/start", response_model=StartTestSessionResponse)
def start_test_session(session_id: int, db: Session = Depends(get_db)):
    """Starts the timer for a test session."""
    session = db.query(CodingTestSession).filter(CodingTestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")
    if session.status != TestSessionStatus.scheduled:
        raise HTTPException(status_code=400, detail="Test session has already been started or completed.")

    # This is where you would fetch the challenges associated with the session's job description
    # For now, let's grab a few based on difficulty
    challenges = db.query(CodingChallenge).filter(
        CodingChallenge.job_description_id == session.job_description_id
    ).limit(3).all()
    if not challenges:
        raise HTTPException(status_code=400, detail="No challenges found for this job description.")

    session.status = TestSessionStatus.started
    session.started_at = datetime.utcnow()
    # Assuming duration comes from the creation request, though not in the model.
    # Let's use a default of 60 minutes.
    session.expires_at = datetime.utcnow() + timedelta(minutes=60)
    db.commit()
    db.refresh(session)

    return StartTestSessionResponse(session=session, challenges=challenges)

@router.post("/sessions/{session_id}/end", response_model=FinalEvaluationResponse)
def end_test_session(session_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Ends a test session and triggers the final evaluation."""
    session = db.query(CodingTestSession).filter(CodingTestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")
    if session.status == TestSessionStatus.completed:
        raise HTTPException(status_code=400, detail="Test session already completed.")

    session.status = TestSessionStatus.completed
    session.ended_at = datetime.utcnow()
    db.commit()

    background_tasks.add_task(generate_final_test_summary, session_id, db)
    db.refresh(session)

    # Prepare a preliminary response
    return FinalEvaluationResponse(
        session_id=session.id,
        status=session.status,
        overall_score=session.overall_score,
        final_evaluation_summary="Evaluation in progress. Please check back later.",
        submissions=[] # You could populate this with submission IDs
    )

# --- Submission & Anti-Cheating ---
@router.post("/submissions", response_model=SubmitCodeResponse)
async def submit_code(
    request: SubmitCodeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handles a candidate's code submission, executes it, and queues AI evaluation."""
    session = db.query(CodingTestSession).filter(CodingTestSession.id == request.session_id).first()
    if not session or session.status != TestSessionStatus.started:
        raise HTTPException(status_code=403, detail="Invalid or inactive test session.")

    challenge = db.query(CodingChallenge).filter(CodingChallenge.id == request.challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="Coding challenge not found.")

    # 1. Execute code
    execution_result_data = await execute_code_in_sandbox(request.code, request.language, challenge.test_cases)
    execution_result = ExecutionResult(**execution_result_data)

    # 2. Create submission record
    submission = CandidateSubmission(
        test_session_id=request.session_id,
        challenge_id=request.challenge_id,
        language=request.language,
        code=request.code,
        execution_result=execution_result.dict()
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # 3. Queue AI evaluation
    background_tasks.add_task(evaluate_submission_with_ai, submission.id, db)

    return SubmitCodeResponse(
        submission_id=submission.id,
        execution_result=execution_result
    )

@router.post("/sessions/events", status_code=status.HTTP_204_NO_CONTENT)
def log_anti_cheat_event(request: AntiCheatEventRequest, db: Session = Depends(get_db)):
    """Logs an anti-cheating event for a session."""
    session = db.query(CodingTestSession).filter(CodingTestSession.id == request.session_id).first()
    if not session or session.status != TestSessionStatus.started:
        raise HTTPException(status_code=403, detail="Invalid or inactive test session.")

    if request.event_type == 'focus_change':
        session.window_focus_changes += 1
    elif request.event_type == 'paste':
        session.paste_count += 1
    else:
        raise HTTPException(status_code=400, detail="Invalid event type.")

    db.commit()
    return None

@router.get("/sessions/{session_id}/evaluation", response_model=FinalEvaluationResponse)
def get_final_session_evaluation(session_id: int, db: Session = Depends(get_db)):
    """Poll this endpoint to get the final evaluation summary of a test session."""
    session = db.query(CodingTestSession).filter(CodingTestSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Test session not found")

    if session.status != TestSessionStatus.completed:
        raise HTTPException(status_code=400, detail=f"Session not completed. Current status: {session.status.value}")

    if not session.final_evaluation_summary:
        return FinalEvaluationResponse(
            session_id=session.id,
            status=session.status,
            final_evaluation_summary="Evaluation is still in progress. Please check back in a few moments.",
            submissions=[]
        )
    
    # Populate submission details for the final response
    submission_details = []
    for sub in session.submissions:
        eval_details = {}
        if sub.evaluation:
            eval_details = {
                "correctness_score": sub.evaluation.correctness_score,
                "efficiency_score": sub.evaluation.efficiency_score,
                "style_score": sub.evaluation.style_score,
                "ai_feedback": sub.evaluation.ai_feedback
            }
        submission_details.append({
            "challenge_title": sub.challenge.title,
            "language": sub.language,
            "passed_tests": sub.execution_result.get("passed_tests", 0),
            "total_tests": sub.execution_result.get("total_tests", 0),
            "evaluation": eval_details
        })

    return FinalEvaluationResponse(
        session_id=session.id,
        status=session.status,
        overall_score=session.overall_score,
        final_evaluation_summary=session.final_evaluation_summary,
        submissions=submission_details
    )
