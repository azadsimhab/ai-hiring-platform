from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import logging
import json
import uuid
import os
from datetime import datetime

from app.db.session import get_db
from app.models.multimodal_screening import InterviewSession, ScreeningQuestion, CandidateResponse, ResponseEvaluation, InterviewStatus, ResponseStatus, SessionType
from app.models.resume_scanner import CandidateProfile
from app.models.jd_generator import JobDescription, InterviewQuestion
from app.schemas.multimodal_screening import (
    InterviewSessionCreate,
    InterviewSessionUpdate,
    InterviewSessionResponse,
    InterviewSessionDetailResponse,
    StartInterviewRequest,
    StartInterviewResponse,
    SubmitResponseRequest,
    SubmitResponseResponse,
    EndInterviewResponse
)
from app.core.config import settings
from app.services.ai_service import get_gemini_client
from app.services.storage_service import upload_file

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Background Tasks ---

async def process_candidate_response(
    response_id: int,
    db: Session
):
    """
    Background task to process a candidate's audio/video response.
    1. Transcribe audio to text.
    2. Evaluate the transcribed text against the question.
    """
    logger.info(f"Starting background processing for response_id: {response_id}")
    response_record = db.query(CandidateResponse).filter(CandidateResponse.id == response_id).first()
    if not response_record:
        logger.error(f"Response record with id {response_id} not found.")
        return

    try:
        # Update status to processing
        response_record.processing_status = ResponseStatus.processing
        db.commit()

        # --- Step 1: Transcribe Audio ---
        # In a real implementation, you would download the audio from response_record.audio_url
        # and send it to a speech-to-text service.
        # For now, we'll simulate this.
        # This is where you would integrate Google Speech-to-Text API.
        # transcribed_text = await speech_to_text_service(response_record.audio_url)
        transcribed_text = "This is a simulated transcription of the candidate's answer. The candidate demonstrated strong problem-solving skills by outlining a clear, multi-step plan."
        response_record.response_text = transcribed_text
        db.commit()
        logger.info(f"Successfully transcribed response for response_id: {response_id}")

        # --- Step 2: Evaluate Response with AI ---
        gemini = get_gemini_client()
        question = response_record.screening_question
        ideal_answer_points = question.original_question.ideal_answer_points if question.original_question else []

        prompt = f"""
        You are an expert interview evaluator. Analyze the candidate's response to the following interview question.

        Question: "{question.question_text}"
        Ideal Answer Points: {json.dumps(ideal_answer_points)}

        Candidate's Response: "{transcribed_text}"

        Please evaluate the response based on the following criteria and provide your output in a valid JSON format:
        1.  relevance_score (0-100): How relevant was the answer to the question asked?
        2.  clarity_score (0-100): How clear and structured was the communication?
        3.  sentiment_score (-1.0 to 1.0): The overall sentiment of the response.
        4.  confidence_score (0-100): The perceived confidence of the candidate.
        5.  keyword_matches: A list of keywords from the ideal answer points that were mentioned.
        6.  ai_feedback: A brief, constructive feedback paragraph for the candidate.

        JSON Output format:
        {{
            "relevance_score": 85,
            "clarity_score": 92,
            "sentiment_score": 0.8,
            "confidence_score": 88,
            "keyword_matches": ["teamwork", "leadership"],
            "ai_feedback": "The candidate provided a clear, structured answer that directly addressed the question. They effectively used the STAR method..."
        }}
        """

        ai_response = await gemini.generate_content(prompt)
        ai_response_text = ai_response.text

        try:
            start_idx = ai_response_text.find('{')
            end_idx = ai_response_text.rfind('}') + 1
            json_str = ai_response_text[start_idx:end_idx]
            eval_data = json.loads(json_str)

            evaluation = ResponseEvaluation(
                candidate_response_id=response_id,
                **eval_data
            )
            db.add(evaluation)
            response_record.processing_status = ResponseStatus.completed
            db.commit()
            logger.info(f"Successfully evaluated response for response_id: {response_id}")

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI evaluation response as JSON: {e}")
            logger.error(f"Response text: {ai_response_text}")
            response_record.processing_status = ResponseStatus.failed
            response_record.processing_error = "Failed to parse AI evaluation."
            db.commit()

    except Exception as e:
        logger.error(f"Error processing response {response_id}: {str(e)}")
        response_record.processing_status = ResponseStatus.failed
        response_record.processing_error = str(e)
        db.commit()


async def generate_final_interview_summary(
    session_id: int,
    db: Session
):
    """
    Background task to generate a final summary for the entire interview.
    """
    logger.info(f"Generating final summary for interview session_id: {session_id}")
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session or session.status != InterviewStatus.completed:
        logger.warning(f"Session {session_id} not found or not completed. Aborting summary generation.")
        return

    # Gather all data
    full_interview_data = []
    for sq in session.screening_questions:
        item = {"question": sq.question_text}
        if sq.candidate_response:
            item["response"] = sq.candidate_response.response_text
            if sq.candidate_response.evaluation:
                item["evaluation"] = {
                    "relevance": sq.candidate_response.evaluation.relevance_score,
                    "clarity": sq.candidate_response.evaluation.clarity_score,
                }
        full_interview_data.append(item)

    if not full_interview_data:
        logger.warning(f"No responses found for session {session_id}. Cannot generate summary.")
        return

    # Create prompt for Gemini
    gemini = get_gemini_client()
    prompt = f"""
    You are an expert hiring manager. Based on the following full interview transcript and individual evaluations, provide a final, overall evaluation summary for the candidate.

    Interview Data:
    {json.dumps(full_interview_data, indent=2)}

    Please provide a comprehensive summary in a valid JSON format with the following structure:
    {{
        "overall_score": 88.5,
        "communication_score": 90,
        "technical_score": 85,
        "behavioral_score": 92,
        "summary": "A high-level text summary of the candidate's performance, highlighting their suitability for the role.",
        "key_strengths": ["List of 3-5 key strengths observed during the interview."],
        "areas_for_improvement": ["List of 2-3 areas where the candidate could improve."]
    }}
    """

    try:
        ai_response = await gemini.generate_content(prompt)
        ai_response_text = ai_response.text
        start_idx = ai_response_text.find('{')
        end_idx = ai_response_text.rfind('}') + 1
        json_str = ai_response_text[start_idx:end_idx]
        summary_data = json.loads(json_str)

        session.overall_ai_evaluation = summary_data
        db.commit()
        logger.info(f"Successfully generated final summary for session {session_id}")

    except Exception as e:
        logger.error(f"Failed to generate final summary for session {session_id}: {str(e)}")


# --- API Routes ---

@router.post("/start", response_model=StartInterviewResponse, status_code=status.HTTP_201_CREATED)
async def start_interview_session(
    request: StartInterviewRequest,
    db: Session = Depends(get_db)
):
    """
    Creates and starts a new interview session.
    - Generates or selects questions.
    - Creates the session and question records in the DB.
    - Returns the session ID and the first question.
    """
    # Validate candidate and job description
    candidate = db.query(CandidateProfile).filter(CandidateProfile.id == request.candidate_profile_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate profile not found")
    job_desc = db.query(JobDescription).filter(JobDescription.id == request.job_description_id).first()
    if not job_desc:
        raise HTTPException(status_code=404, detail="Job description not found")

    # Create the interview session
    session = InterviewSession(
        candidate_profile_id=request.candidate_profile_id,
        job_description_id=request.job_description_id,
        session_type=request.session_type,
        status=InterviewStatus.in_progress,
        started_at=datetime.utcnow()
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Fetch or generate questions
    # For simplicity, we'll fetch existing questions. Generation would be a more complex flow.
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.job_description_id == request.job_description_id
    ).limit(request.num_questions).all()

    if not questions:
        raise HTTPException(status_code=400, detail="No interview questions found for this job description. Please generate them first.")

    # Create screening question records
    screening_questions = []
    for i, q in enumerate(questions):
        sq = ScreeningQuestion(
            interview_session_id=session.id,
            original_question_id=q.id,
            question_text=q.question,
            question_type=q.type,
            order=i + 1
        )
        db.add(sq)
        screening_questions.append(sq)
    
    db.commit()
    for sq in screening_questions:
        db.refresh(sq)

    return StartInterviewResponse(
        interview_session_id=session.id,
        status=session.status,
        first_question=screening_questions[0]
    )

@router.post("/{session_id}/responses", response_model=SubmitResponseResponse)
async def submit_candidate_response(
    session_id: int,
    background_tasks: BackgroundTasks,
    screening_question_id: int = Form(...),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Submits a candidate's audio response for a specific question.
    - Uploads the audio file to Cloud Storage.
    - Creates the response record in the DB.
    - Triggers a background task for processing.
    - Returns the next question or a completion signal.
    """
    # Validate session and question
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session or session.status != InterviewStatus.in_progress:
        raise HTTPException(status_code=404, detail="Active interview session not found")
    
    question = db.query(ScreeningQuestion).filter(
        ScreeningQuestion.id == screening_question_id,
        ScreeningQuestion.interview_session_id == session_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Screening question not found in this session")

    # Upload audio file to storage
    file_extension = os.path.splitext(audio_file.filename)[1] if audio_file.filename else ".webm"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    storage_path = f"interview_responses/{session_id}/{unique_filename}"
    
    file_content = await audio_file.read()
    audio_url = await upload_file(storage_path, file_content, audio_file.content_type)

    # Create candidate response record
    response = CandidateResponse(
        screening_question_id=screening_question_id,
        audio_url=audio_url,
        processing_status=ResponseStatus.pending
    )
    db.add(response)
    db.commit()
    db.refresh(response)

    # Trigger background processing
    background_tasks.add_task(process_candidate_response, response.id, db)

    # Determine the next question
    next_question = db.query(ScreeningQuestion).filter(
        ScreeningQuestion.interview_session_id == session_id,
        ScreeningQuestion.order > question.order
    ).order_by(ScreeningQuestion.order.asc()).first()

    interview_completed = next_question is None

    return SubmitResponseResponse(
        next_question=next_question,
        interview_completed=interview_completed
    )

@router.post("/{session_id}/end", response_model=EndInterviewResponse)
async def end_interview_session(
    session_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Marks an interview session as completed and triggers final summary generation.
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    session.status = InterviewStatus.completed
    session.ended_at = datetime.utcnow()
    db.commit()
    db.refresh(session)

    # Trigger final summary generation
    background_tasks.add_task(generate_final_interview_summary, session.id, db)

    # The evaluation_url should point to a GET endpoint for fetching the summary
    evaluation_url = f"{settings.API_V1_STR}/screening/{session_id}/evaluation"

    return EndInterviewResponse(
        interview_session_id=session.id,
        final_status=session.status,
        evaluation_url=evaluation_url
    )

@router.get("/{session_id}", response_model=InterviewSessionDetailResponse)
def get_interview_session_details(
    session_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieves the full details of an interview session, including questions,
    responses, and evaluations.
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")
    
    # Eagerly load related data for the response model
    # This can be optimized with joinedload options in the query
    session.candidate_profile = db.query(CandidateProfile).get(session.candidate_profile_id)
    session.job_description = db.query(JobDescription).get(session.job_description_id)
    
    return session

@router.get("/{session_id}/evaluation", response_model=Dict[str, Any])
def get_final_evaluation(
    session_id: int,
    db: Session = Depends(get_db)
):
    """
    Fetches the final AI-generated evaluation summary for a completed interview.
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    if session.status != InterviewStatus.completed:
        return {"status": "Interview not completed yet."}

    if not session.overall_ai_evaluation:
        return {"status": "Evaluation is still being processed. Please check back later."}

    return session.overall_ai_evaluation

@router.put("/{session_id}", response_model=InterviewSessionResponse)
def update_interview_session(
    session_id: int,
    update_data: InterviewSessionUpdate,
    db: Session = Depends(get_db)
):
    """
    Allows a human reviewer to update an interview session, e.g., add notes.
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    update_dict = update_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(session, key, value)
    
    db.commit()
    db.refresh(session)
    return session

@router.get("/candidate/{candidate_id}", response_model=List[InterviewSessionResponse])
def list_sessions_for_candidate(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    """
    Lists all interview sessions for a specific candidate.
    """
    sessions = db.query(InterviewSession).filter(InterviewSession.candidate_profile_id == candidate_id).all()
    return sessions
