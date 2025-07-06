from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import json

from app.db.session import get_db
from app.models.jd_generator import JobDescription, InterviewQuestion
from app.schemas.jd_generator import (
    JobDescriptionCreate, 
    JobDescriptionUpdate, 
    JobDescriptionResponse,
    InterviewQuestionCreate,
    InterviewQuestionResponse,
    GenerateJDRequest,
    GenerateQuestionsRequest
)
from app.core.config import settings
from app.services.ai_service import get_gemini_client

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=JobDescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_job_description(
    jd: JobDescriptionCreate, 
    db: Session = Depends(get_db)
):
    """Create a new job description"""
    db_jd = JobDescription(**jd.dict())
    db.add(db_jd)
    db.commit()
    db.refresh(db_jd)
    return db_jd

@router.get("/{jd_id}", response_model=JobDescriptionResponse)
def get_job_description(
    jd_id: int, 
    db: Session = Depends(get_db)
):
    """Retrieve a specific job description by ID"""
    db_jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if db_jd is None:
        raise HTTPException(status_code=404, detail="Job description not found")
    return db_jd

@router.get("/", response_model=List[JobDescriptionResponse])
def list_job_descriptions(
    skip: int = 0, 
    limit: int = 100, 
    hiring_request_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """List all job descriptions with optional filtering by hiring request ID"""
    query = db.query(JobDescription)
    
    if hiring_request_id:
        query = query.filter(JobDescription.hiring_request_id == hiring_request_id)
        
    return query.offset(skip).limit(limit).all()

@router.put("/{jd_id}", response_model=JobDescriptionResponse)
def update_job_description(
    jd_id: int, 
    jd_update: JobDescriptionUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing job description"""
    db_jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if db_jd is None:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    update_data = jd_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_jd, key, value)
    
    db.commit()
    db.refresh(db_jd)
    return db_jd

@router.delete("/{jd_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_description(
    jd_id: int, 
    db: Session = Depends(get_db)
):
    """Delete a job description"""
    db_jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if db_jd is None:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    db.delete(db_jd)
    db.commit()
    return None

@router.post("/generate", response_model=JobDescriptionResponse)
async def generate_job_description(
    request: GenerateJDRequest,
    db: Session = Depends(get_db)
):
    """Generate a job description using AI based on hiring request details"""
    try:
        gemini = get_gemini_client()
        
        prompt = f"""
        Generate a professional job description based on the following details:
        
        Job Title: {request.job_title}
        Department: {request.department}
        Experience Level: {request.experience_level}
        Skills Required: {', '.join(request.skills_required)}
        Job Type: {request.job_type}
        Location: {request.location}
        
        Additional Context:
        {request.additional_context}
        
        The job description should include:
        1. A compelling company overview
        2. Detailed responsibilities
        3. Required qualifications
        4. Preferred qualifications
        5. Benefits and perks
        6. Equal opportunity statement
        
        Format the response as JSON with the following structure:
        {{
            "title": "Job title",
            "overview": "Company and role overview paragraph",
            "responsibilities": ["Responsibility 1", "Responsibility 2", ...],
            "required_qualifications": ["Qualification 1", "Qualification 2", ...],
            "preferred_qualifications": ["Qualification 1", "Qualification 2", ...],
            "benefits": ["Benefit 1", "Benefit 2", ...],
            "equal_opportunity_statement": "Statement text"
        }}
        """
        
        response = await gemini.generate_content(prompt)
        response_text = response.text
        
        # Extract JSON from response if needed
        try:
            # Find JSON in the response if it's wrapped in markdown or other text
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx >= 0 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                jd_content = json.loads(json_str)
            else:
                jd_content = json.loads(response_text)
                
            # Create a new job description
            db_jd = JobDescription(
                hiring_request_id=request.hiring_request_id,
                title=jd_content.get("title", request.job_title),
                overview=jd_content.get("overview", ""),
                responsibilities=jd_content.get("responsibilities", []),
                required_qualifications=jd_content.get("required_qualifications", []),
                preferred_qualifications=jd_content.get("preferred_qualifications", []),
                benefits=jd_content.get("benefits", []),
                equal_opportunity_statement=jd_content.get("equal_opportunity_statement", ""),
                status="draft",
                ai_generated=True
            )
            
            db.add(db_jd)
            db.commit()
            db.refresh(db_jd)
            return db_jd
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            logger.error(f"Response text: {response_text}")
            raise HTTPException(
                status_code=500, 
                detail="Failed to parse AI-generated job description"
            )
            
    except Exception as e:
        logger.error(f"Error generating job description: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate job description: {str(e)}"
        )

@router.post("/{jd_id}/questions", response_model=List[InterviewQuestionResponse])
async def generate_interview_questions(
    jd_id: int,
    request: GenerateQuestionsRequest,
    db: Session = Depends(get_db)
):
    """Generate interview questions based on a job description"""
    db_jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if db_jd is None:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    try:
        gemini = get_gemini_client()
        
        prompt = f"""
        Generate {request.count} interview questions for a {db_jd.title} position.
        
        Job Description Overview:
        {db_jd.overview}
        
        Key Responsibilities:
        {', '.join(db_jd.responsibilities)}
        
        Required Qualifications:
        {', '.join(db_jd.required_qualifications)}
        
        Question Types Requested: {', '.join(request.question_types)}
        Difficulty Level: {request.difficulty_level}
        
        Format the response as JSON with the following structure:
        [
            {{
                "question": "Question text",
                "type": "behavioral|technical|situational",
                "difficulty": "easy|medium|hard",
                "purpose": "Brief explanation of what this question assesses",
                "ideal_answer_points": ["Point 1", "Point 2", ...]
            }},
            ...
        ]
        """
        
        response = await gemini.generate_content(prompt)
        response_text = response.text
        
        try:
            # Find JSON in the response if it's wrapped in markdown or other text
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']') + 1
            if start_idx >= 0 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                questions_data = json.loads(json_str)
            else:
                questions_data = json.loads(response_text)
            
            # Create interview questions in the database
            created_questions = []
            for q_data in questions_data:
                db_question = InterviewQuestion(
                    job_description_id=jd_id,
                    question=q_data.get("question", ""),
                    type=q_data.get("type", ""),
                    difficulty=q_data.get("difficulty", ""),
                    purpose=q_data.get("purpose", ""),
                    ideal_answer_points=q_data.get("ideal_answer_points", []),
                    ai_generated=True
                )
                db.add(db_question)
                created_questions.append(db_question)
            
            db.commit()
            for question in created_questions:
                db.refresh(question)
            
            return created_questions
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            logger.error(f"Response text: {response_text}")
            raise HTTPException(
                status_code=500, 
                detail="Failed to parse AI-generated interview questions"
            )
            
    except Exception as e:
        logger.error(f"Error generating interview questions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate interview questions: {str(e)}"
        )

@router.get("/{jd_id}/questions", response_model=List[InterviewQuestionResponse])
def get_interview_questions(
    jd_id: int,
    db: Session = Depends(get_db)
):
    """Get all interview questions for a specific job description"""
    db_jd = db.query(JobDescription).filter(JobDescription.id == jd_id).first()
    if db_jd is None:
        raise HTTPException(status_code=404, detail="Job description not found")
    
    questions = db.query(InterviewQuestion).filter(
        InterviewQuestion.job_description_id == jd_id
    ).all()
    
    return questions

@router.delete("/{jd_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview_question(
    jd_id: int,
    question_id: int,
    db: Session = Depends(get_db)
):
    """Delete a specific interview question"""
    question = db.query(InterviewQuestion).filter(
        InterviewQuestion.id == question_id,
        InterviewQuestion.job_description_id == jd_id
    ).first()
    
    if question is None:
        raise HTTPException(status_code=404, detail="Interview question not found")
    
    db.delete(question)
    db.commit()
    return None
