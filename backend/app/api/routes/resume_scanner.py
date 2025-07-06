from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
import logging
import json
import os
import uuid
from datetime import datetime

from app.db.session import get_db
from app.models.resume_scanner import Resume, CandidateProfile, SkillEvaluation, ResumeEvaluation
from app.models.jd_generator import JobDescription
from app.schemas.resume_scanner import (
    ResumeCreate,
    ResumeUpdate,
    ResumeResponse,
    CandidateProfileCreate,
    CandidateProfileUpdate,
    CandidateProfileResponse,
    SkillEvaluationCreate,
    SkillEvaluationResponse,
    ResumeEvaluationCreate,
    ResumeEvaluationUpdate,
    ResumeEvaluationResponse,
    ParseResumeRequest,
    EvaluateResumeRequest,
    BatchEvaluateRequest,
    ResumeUploadResponse,
    ResumeSearchParams,
    ResumeComparisonResponse
)
from app.core.config import settings
from app.services.ai_service import get_gemini_client
from app.services.storage_service import upload_file, get_file_url, delete_file

router = APIRouter()
logger = logging.getLogger(__name__)

# Helper functions
async def extract_text_from_resume(file_path: str, file_type: str) -> str:
    """Extract text content from a resume file"""
    # This is a placeholder - in a real implementation, you would use 
    # libraries like PyPDF2, python-docx, etc. based on file type
    # For now, we'll simulate this by returning a placeholder
    return "Resume text content would be extracted here based on file type"

async def process_resume_in_background(
    resume_id: int,
    db: Session
):
    """Background task to process a resume"""
    try:
        # Get the resume
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            logger.error(f"Resume with ID {resume_id} not found")
            return
        
        # Update status
        resume.processing_status = "processing"
        db.commit()
        
        # Get file content (in a real implementation, this would extract text from the file)
        # For now, we'll use a placeholder
        if not resume.content_text:
            resume.content_text = await extract_text_from_resume(resume.file_path, resume.file_type)
        
        # Parse resume with AI
        gemini = get_gemini_client()
        
        prompt = f"""
        You are an expert resume parser. Please extract structured information from the following resume.
        
        Resume content:
        {resume.content_text}
        
        Extract the following information in JSON format:
        1. Candidate's name
        2. Contact information (email, phone, location)
        3. Professional summary
        4. Years of experience (estimate if not explicitly stated)
        5. Education history (institution, degree, field, dates)
        6. Skills list
        7. Work history (company, title, dates, description)
        8. Certifications
        9. Languages
        10. URLs (LinkedIn, GitHub, portfolio)
        
        Format the response as a valid JSON object with the following structure:
        {{
            "name": "Candidate Name",
            "email": "email@example.com",
            "phone": "phone number",
            "location": "City, State",
            "summary": "Professional summary text",
            "experience_years": 5.5,
            "education": [
                {{
                    "institution": "University Name",
                    "degree": "Degree Name",
                    "field_of_study": "Field",
                    "start_date": "YYYY-MM",
                    "end_date": "YYYY-MM",
                    "gpa": 3.8
                }}
            ],
            "skills": ["Skill 1", "Skill 2"],
            "work_history": [
                {{
                    "company": "Company Name",
                    "title": "Job Title",
                    "location": "City, State",
                    "start_date": "YYYY-MM",
                    "end_date": "YYYY-MM",
                    "is_current": false,
                    "description": "Job description",
                    "achievements": ["Achievement 1", "Achievement 2"]
                }}
            ],
            "certifications": ["Certification 1", "Certification 2"],
            "languages": [
                {{
                    "language": "Language Name",
                    "proficiency": "Proficiency Level"
                }}
            ],
            "linkedin_url": "URL",
            "github_url": "URL",
            "portfolio_url": "URL"
        }}
        """
        
        response = await gemini.generate_content(prompt)
        response_text = response.text
        
        # Extract JSON from response
        try:
            # Find JSON in the response if it's wrapped in markdown or other text
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            if start_idx >= 0 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                parsed_data = json.loads(json_str)
            else:
                parsed_data = json.loads(response_text)
            
            # Store structured content
            resume.content_structure = parsed_data
            resume.ai_processed = True
            
            # Create or update candidate profile
            candidate_profile = db.query(CandidateProfile).filter(CandidateProfile.resume_id == resume.id).first()
            
            if not candidate_profile:
                candidate_profile = CandidateProfile(
                    resume_id=resume.id,
                    name=parsed_data.get("name"),
                    email=parsed_data.get("email"),
                    phone=parsed_data.get("phone"),
                    location=parsed_data.get("location"),
                    summary=parsed_data.get("summary"),
                    experience_years=parsed_data.get("experience_years"),
                    education=parsed_data.get("education", []),
                    skills=parsed_data.get("skills", []),
                    work_history=parsed_data.get("work_history", []),
                    certifications=parsed_data.get("certifications", []),
                    languages=parsed_data.get("languages", []),
                    linkedin_url=parsed_data.get("linkedin_url"),
                    github_url=parsed_data.get("github_url"),
                    portfolio_url=parsed_data.get("portfolio_url"),
                    ai_generated=True
                )
                db.add(candidate_profile)
            else:
                # Update existing profile
                candidate_profile.name = parsed_data.get("name", candidate_profile.name)
                candidate_profile.email = parsed_data.get("email", candidate_profile.email)
                candidate_profile.phone = parsed_data.get("phone", candidate_profile.phone)
                candidate_profile.location = parsed_data.get("location", candidate_profile.location)
                candidate_profile.summary = parsed_data.get("summary", candidate_profile.summary)
                candidate_profile.experience_years = parsed_data.get("experience_years", candidate_profile.experience_years)
                candidate_profile.education = parsed_data.get("education", candidate_profile.education)
                candidate_profile.skills = parsed_data.get("skills", candidate_profile.skills)
                candidate_profile.work_history = parsed_data.get("work_history", candidate_profile.work_history)
                candidate_profile.certifications = parsed_data.get("certifications", candidate_profile.certifications)
                candidate_profile.languages = parsed_data.get("languages", candidate_profile.languages)
                candidate_profile.linkedin_url = parsed_data.get("linkedin_url", candidate_profile.linkedin_url)
                candidate_profile.github_url = parsed_data.get("github_url", candidate_profile.github_url)
                candidate_profile.portfolio_url = parsed_data.get("portfolio_url", candidate_profile.portfolio_url)
                candidate_profile.ai_generated = True
            
            # Update resume status
            resume.processing_status = "completed"
            
            db.commit()
            logger.info(f"Successfully processed resume {resume_id}")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            logger.error(f"Response text: {response_text}")
            resume.processing_status = "failed"
            db.commit()
            
    except Exception as e:
        logger.error(f"Error processing resume {resume_id}: {str(e)}")
        # Update resume status to failed
        try:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()
            if resume:
                resume.processing_status = "failed"
                db.commit()
        except Exception as inner_e:
            logger.error(f"Error updating resume status: {str(inner_e)}")

async def evaluate_resume_against_jd(
    resume_id: int,
    job_description_id: int,
    db: Session
):
    """Evaluate a resume against a job description using AI"""
    try:
        # Get the resume and job description
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        job_description = db.query(JobDescription).filter(JobDescription.id == job_description_id).first()
        candidate_profile = db.query(CandidateProfile).filter(CandidateProfile.resume_id == resume_id).first()
        
        if not resume or not job_description or not candidate_profile:
            logger.error(f"Resume {resume_id} or JD {job_description_id} or candidate profile not found")
            return
        
        # Get AI client
        gemini = get_gemini_client()
        
        # First, evaluate individual skills
        required_skills = job_description.required_qualifications
        candidate_skills = candidate_profile.skills
        
        # Clear existing skill evaluations
        db.query(SkillEvaluation).filter(
            and_(
                SkillEvaluation.candidate_profile_id == candidate_profile.id,
                SkillEvaluation.job_description_id == job_description_id
            )
        ).delete()
        
        # For each required skill, check if the candidate has it
        for skill in required_skills:
            skill_prompt = f"""
            You are an expert resume evaluator. Evaluate how well the candidate's skills and experience match the required skill.
            
            Required skill: {skill}
            
            Candidate information:
            - Skills: {', '.join(candidate_skills)}
            - Experience: {candidate_profile.experience_years} years
            - Work history: {json.dumps(candidate_profile.work_history)}
            - Education: {json.dumps(candidate_profile.education)}
            - Certifications: {', '.join(candidate_profile.certifications or [])}
            
            Evaluate:
            1. Does the candidate have this skill explicitly listed? (yes/no)
            2. If not explicitly listed, is there evidence they might have this skill based on their experience? (yes/no)
            3. What level of proficiency do they likely have? (beginner, intermediate, advanced, expert)
            4. Score their match for this skill on a scale of 0-100
            5. How confident are you in this assessment? (0.0-1.0)
            
            Format your response as a JSON object:
            {
                "has_skill": true/false,
                "evidence_based": true/false,
                "proficiency_level": "level",
                "score": 85,
                "confidence": 0.9,
                "notes": "Brief explanation"
            }
            """
            
            skill_response = await gemini.generate_content(skill_prompt)
            skill_text = skill_response.text
            
            try:
                # Parse JSON response
                start_idx = skill_text.find('{')
                end_idx = skill_text.rfind('}') + 1
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = skill_text[start_idx:end_idx]
                    skill_data = json.loads(json_str)
                else:
                    skill_data = json.loads(skill_text)
                
                # Create skill evaluation
                skill_eval = SkillEvaluation(
                    candidate_profile_id=candidate_profile.id,
                    job_description_id=job_description_id,
                    skill_name=skill,
                    skill_score=skill_data.get("score", 0),
                    skill_required_level="advanced",  # This would ideally be extracted from the JD
                    skill_detected_level=skill_data.get("proficiency_level", "none"),
                    confidence=skill_data.get("confidence", 0.5),
                    evaluation_notes=skill_data.get("notes", "")
                )
                db.add(skill_eval)
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse skill evaluation response: {e}")
                logger.error(f"Response text: {skill_text}")
        
        # Now, generate overall evaluation
        overall_prompt = f"""
        You are an expert resume evaluator. Evaluate how well the candidate's profile matches the job description.
        
        Job Description:
        - Title: {job_description.title}
        - Overview: {job_description.overview}
        - Responsibilities: {json.dumps(job_description.responsibilities)}
        - Required Qualifications: {json.dumps(job_description.required_qualifications)}
        - Preferred Qualifications: {json.dumps(job_description.preferred_qualifications)}
        
        Candidate Profile:
        - Name: {candidate_profile.name}
        - Experience: {candidate_profile.experience_years} years
        - Summary: {candidate_profile.summary}
        - Skills: {json.dumps(candidate_profile.skills)}
        - Education: {json.dumps(candidate_profile.education)}
        - Work History: {json.dumps(candidate_profile.work_history)}
        - Certifications: {json.dumps(candidate_profile.certifications)}
        
        Provide a comprehensive evaluation of the candidate's fit for this position. Include:
        1. Overall match score (0-100)
        2. Experience match score (0-100)
        3. Education match score (0-100)
        4. Skills match score (0-100)
        5. Key strengths relative to the job requirements
        6. Key weaknesses or gaps relative to the job requirements
        7. Overall evaluation notes
        
        Format your response as a JSON object:
        {
            "overall_match_score": 75,
            "experience_score": 80,
            "education_score": 90,
            "skills_score": 70,
            "strengths": ["Strength 1", "Strength 2", "Strength 3"],
            "weaknesses": ["Weakness 1", "Weakness 2"],
            "evaluation_notes": "Detailed evaluation notes..."
        }
        """
        
        overall_response = await gemini.generate_content(overall_prompt)
        overall_text = overall_response.text
        
        try:
            # Parse JSON response
            start_idx = overall_text.find('{')
            end_idx = overall_text.rfind('}') + 1
            if start_idx >= 0 and end_idx > start_idx:
                json_str = overall_text[start_idx:end_idx]
                eval_data = json.loads(json_str)
            else:
                eval_data = json.loads(overall_text)
            
            # Create or update resume evaluation
            existing_eval = db.query(ResumeEvaluation).filter(
                and_(
                    ResumeEvaluation.resume_id == resume_id,
                    ResumeEvaluation.job_description_id == job_description_id
                )
            ).first()
            
            if existing_eval:
                existing_eval.overall_match_score = eval_data.get("overall_match_score", existing_eval.overall_match_score)
                existing_eval.experience_score = eval_data.get("experience_score", existing_eval.experience_score)
                existing_eval.education_score = eval_data.get("education_score", existing_eval.education_score)
                existing_eval.skills_score = eval_data.get("skills_score", existing_eval.skills_score)
                existing_eval.strengths = eval_data.get("strengths", existing_eval.strengths)
                existing_eval.weaknesses = eval_data.get("weaknesses", existing_eval.weaknesses)
                existing_eval.evaluation_notes = eval_data.get("evaluation_notes", existing_eval.evaluation_notes)
                existing_eval.ai_generated = True
            else:
                new_eval = ResumeEvaluation(
                    resume_id=resume_id,
                    job_description_id=job_description_id,
                    overall_match_score=eval_data.get("overall_match_score", 0),
                    experience_score=eval_data.get("experience_score"),
                    education_score=eval_data.get("education_score"),
                    skills_score=eval_data.get("skills_score"),
                    strengths=eval_data.get("strengths", []),
                    weaknesses=eval_data.get("weaknesses", []),
                    evaluation_notes=eval_data.get("evaluation_notes", ""),
                    status="pending",
                    ai_generated=True
                )
                db.add(new_eval)
            
            db.commit()
            logger.info(f"Successfully evaluated resume {resume_id} against JD {job_description_id}")
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse overall evaluation response: {e}")
            logger.error(f"Response text: {overall_text}")
            
    except Exception as e:
        logger.error(f"Error evaluating resume {resume_id} against JD {job_description_id}: {str(e)}")


# API Routes

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    job_description_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload a resume file and start processing"""
    try:
        # Generate a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Define storage path
        current_date = datetime.now().strftime("%Y/%m/%d")
        storage_path = f"resumes/{current_date}/{unique_filename}"
        
        # Upload file to storage
        file_content = await file.read()
        await upload_file(storage_path, file_content, file.content_type)
        
        # Create resume record
        resume = Resume(
            job_description_id=job_description_id,
            file_name=file.filename,
            file_path=storage_path,
            file_type=file.content_type,
            original_file_size=len(file_content),
            processing_status="pending"
        )
        
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        # Start background processing
        background_tasks.add_task(process_resume_in_background, resume.id, db)
        
        return ResumeUploadResponse(
            resume_id=resume.id,
            file_name=resume.file_name,
            processing_status=resume.processing_status
        )
        
    except Exception as e:
        logger.error(f"Error uploading resume: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload resume: {str(e)}"
        )

@router.post("/parse", status_code=status.HTTP_202_ACCEPTED)
async def parse_resume(
    request: ParseResumeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Parse a resume that has already been uploaded"""
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {request.resume_id} not found"
        )
    
    # Reset processing status
    resume.processing_status = "pending"
    db.commit()
    
    # Start background processing
    background_tasks.add_task(process_resume_in_background, resume.id, db)
    
    return {"message": f"Resume parsing started for ID {request.resume_id}"}

@router.post("/evaluate", status_code=status.HTTP_202_ACCEPTED)
async def evaluate_resume(
    request: EvaluateResumeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Evaluate a resume against a job description"""
    # Verify resume exists
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {request.resume_id} not found"
        )
    
    # Verify job description exists
    job_description = db.query(JobDescription).filter(JobDescription.id == request.job_description_id).first()
    if not job_description:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with ID {request.job_description_id} not found"
        )
    
    # Verify candidate profile exists
    candidate_profile = db.query(CandidateProfile).filter(CandidateProfile.resume_id == request.resume_id).first()
    if not candidate_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Resume with ID {request.resume_id} has not been parsed yet. Parse it first."
        )
    
    # Start background evaluation
    background_tasks.add_task(
        evaluate_resume_against_jd,
        request.resume_id,
        request.job_description_id,
        db
    )
    
    return {
        "message": f"Resume evaluation started for resume {request.resume_id} against job description {request.job_description_id}"
    }

@router.post("/batch-evaluate", status_code=status.HTTP_202_ACCEPTED)
async def batch_evaluate_resumes(
    request: BatchEvaluateRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Evaluate multiple resumes against a job description"""
    # Verify job description exists
    job_description = db.query(JobDescription).filter(JobDescription.id == request.job_description_id).first()
    if not job_description:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with ID {request.job_description_id} not found"
        )
    
    # Start background evaluation for each resume
    for resume_id in request.resume_ids:
        # Verify resume exists
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if resume:
            # Verify candidate profile exists
            candidate_profile = db.query(CandidateProfile).filter(CandidateProfile.resume_id == resume_id).first()
            if candidate_profile:
                background_tasks.add_task(
                    evaluate_resume_against_jd,
                    resume_id,
                    request.job_description_id,
                    db
                )
            else:
                logger.warning(f"Resume {resume_id} has not been parsed yet. Skipping evaluation.")
        else:
            logger.warning(f"Resume with ID {resume_id} not found. Skipping evaluation.")
    
    return {
        "message": f"Batch evaluation started for {len(request.resume_ids)} resumes against job description {request.job_description_id}"
    }

@router.get("/", response_model=List[ResumeResponse])
def list_resumes(
    job_description_id: Optional[int] = None,
    processing_status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all resumes with optional filtering"""
    query = db.query(Resume)
    
    if job_description_id:
        query = query.filter(Resume.job_description_id == job_description_id)
    
    if processing_status:
        query = query.filter(Resume.processing_status == processing_status)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific resume by ID"""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found"
        )
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db)
):
    """Delete a resume and associated data"""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found"
        )
    
    # Delete the file from storage
    try:
        await delete_file(resume.file_path)
    except Exception as e:
        logger.error(f"Error deleting resume file: {str(e)}")
    
    # Delete the resume from the database
    # (cascade will delete associated candidate profile and evaluations)
    db.delete(resume)
    db.commit()
    
    return None

@router.get("/{resume_id}/download-url")
async def get_resume_download_url(
    resume_id: int,
    db: Session = Depends(get_db)
):
    """Get a temporary download URL for a resume file"""
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found"
        )
    
    # Generate a temporary download URL
    try:
        url = await get_file_url(resume.file_path)
        return {"download_url": url}
    except Exception as e:
        logger.error(f"Error generating download URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate download URL"
        )

@router.get("/{resume_id}/profile", response_model=CandidateProfileResponse)
def get_candidate_profile(
    resume_id: int,
    db: Session = Depends(get_db)
):
    """Get the candidate profile for a resume"""
    profile = db.query(CandidateProfile).filter(CandidateProfile.resume_id == resume_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate profile for resume ID {resume_id} not found"
        )
    return profile

@router.put("/{resume_id}/profile", response_model=CandidateProfileResponse)
def update_candidate_profile(
    resume_id: int,
    profile_update: CandidateProfileUpdate,
    db: Session = Depends(get_db)
):
    """Update a candidate profile"""
    profile = db.query(CandidateProfile).filter(CandidateProfile.resume_id == resume_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate profile for resume ID {resume_id} not found"
        )
    
    # Update profile fields
    update_data = profile_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/{resume_id}/evaluations", response_model=List[ResumeEvaluationResponse])
def get_resume_evaluations(
    resume_id: int,
    db: Session = Depends(get_db)
):
    """Get all evaluations for a resume"""
    evaluations = db.query(ResumeEvaluation).filter(ResumeEvaluation.resume_id == resume_id).all()
    return evaluations

@router.get("/{resume_id}/evaluations/{job_description_id}", response_model=ResumeEvaluationResponse)
def get_specific_evaluation(
    resume_id: int,
    job_description_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific evaluation for a resume against a job description"""
    evaluation = db.query(ResumeEvaluation).filter(
        and_(
            ResumeEvaluation.resume_id == resume_id,
            ResumeEvaluation.job_description_id == job_description_id
        )
    ).first()
    
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation for resume ID {resume_id} and job description ID {job_description_id} not found"
        )
    
    return evaluation

@router.put("/{resume_id}/evaluations/{job_description_id}", response_model=ResumeEvaluationResponse)
def update_evaluation(
    resume_id: int,
    job_description_id: int,
    evaluation_update: ResumeEvaluationUpdate,
    db: Session = Depends(get_db)
):
    """Update a resume evaluation"""
    evaluation = db.query(ResumeEvaluation).filter(
        and_(
            ResumeEvaluation.resume_id == resume_id,
            ResumeEvaluation.job_description_id == job_description_id
        )
    ).first()
    
    if not evaluation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation for resume ID {resume_id} and job description ID {job_description_id} not found"
        )
    
    # Update evaluation fields
    update_data = evaluation_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(evaluation, key, value)
    
    db.commit()
    db.refresh(evaluation)
    return evaluation

@router.get("/{resume_id}/skill-evaluations", response_model=List[SkillEvaluationResponse])
def get_skill_evaluations(
    resume_id: int,
    job_description_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get skill evaluations for a candidate"""
    # Get the candidate profile
    profile = db.query(CandidateProfile).filter(CandidateProfile.resume_id == resume_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate profile for resume ID {resume_id} not found"
        )
    
    # Query skill evaluations
    query = db.query(SkillEvaluation).filter(SkillEvaluation.candidate_profile_id == profile.id)
    
    if job_description_id:
        query = query.filter(SkillEvaluation.job_description_id == job_description_id)
    
    return query.all()

@router.post("/search", response_model=List[Dict[str, Any]])
def search_resumes(
    search_params: ResumeSearchParams,
    db: Session = Depends(get_db)
):
    """Search for resumes based on various criteria"""
    # Start with a query that joins all necessary tables
    query = db.query(
        Resume, 
        CandidateProfile, 
        ResumeEvaluation
    ).join(
        CandidateProfile, 
        Resume.id == CandidateProfile.resume_id
    ).join(
        ResumeEvaluation,
        and_(
            Resume.id == ResumeEvaluation.resume_id,
            ResumeEvaluation.job_description_id == search_params.job_description_id
        )
    )
    
    # Apply filters
    if search_params.job_description_id:
        query = query.filter(ResumeEvaluation.job_description_id == search_params.job_description_id)
    
    if search_params.min_match_score:
        query = query.filter(ResumeEvaluation.overall_match_score >= search_params.min_match_score)
    
    if search_params.status:
        query = query.filter(ResumeEvaluation.status == search_params.status)
    
    if search_params.experience_years_min:
        query = query.filter(CandidateProfile.experience_years >= search_params.experience_years_min)
    
    if search_params.skills:
        # This is a simplified approach - in a real application, you'd use more sophisticated skill matching
        for skill in search_params.skills:
            query = query.filter(CandidateProfile.skills.contains([skill]))
    
    # Apply pagination
    query = query.offset(search_params.offset).limit(search_params.limit)
    
    # Execute query
    results = query.all()
    
    # Format results
    formatted_results = []
    for resume, profile, evaluation in results:
        formatted_results.append({
            "resume_id": resume.id,
            "file_name": resume.file_name,
            "candidate_name": profile.name,
            "experience_years": profile.experience_years,
            "location": profile.location,
            "skills": profile.skills,
            "match_score": evaluation.overall_match_score,
            "status": evaluation.status,
            "created_at": resume.created_at.isoformat() if resume.created_at else None
        })
    
    return formatted_results

@router.get("/job-description/{job_description_id}/top-candidates", response_model=List[Dict[str, Any]])
def get_top_candidates(
    job_description_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get top candidates for a job description based on match score"""
    # Verify job description exists
    job_description = db.query(JobDescription).filter(JobDescription.id == job_description_id).first()
    if not job_description:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with ID {job_description_id} not found"
        )
    
    # Query top candidates
    results = db.query(
        Resume, 
        CandidateProfile, 
        ResumeEvaluation
    ).join(
        CandidateProfile, 
        Resume.id == CandidateProfile.resume_id
    ).join(
        ResumeEvaluation,
        and_(
            Resume.id == ResumeEvaluation.resume_id,
            ResumeEvaluation.job_description_id == job_description_id
        )
    ).order_by(
        ResumeEvaluation.overall_match_score.desc()
    ).limit(limit).all()
    
    # Format results
    formatted_results = []
    for resume, profile, evaluation in results:
        formatted_results.append({
            "resume_id": resume.id,
            "file_name": resume.file_name,
            "candidate_name": profile.name,
            "experience_years": profile.experience_years,
            "location": profile.location,
            "skills": profile.skills,
            "match_score": evaluation.overall_match_score,
            "strengths": evaluation.strengths,
            "weaknesses": evaluation.weaknesses,
            "status": evaluation.status
        })
    
    return formatted_results

@router.get("/job-description/{job_description_id}/comparison", response_model=ResumeComparisonResponse)
def compare_candidates(
    job_description_id: int,
    resume_ids: List[int],
    db: Session = Depends(get_db)
):
    """Compare multiple candidates for a job description"""
    # Verify job description exists
    job_description = db.query(JobDescription).filter(JobDescription.id == job_description_id).first()
    if not job_description:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with ID {job_description_id} not found"
        )
    
    # Get candidate data
    candidates = []
    for resume_id in resume_ids:
        result = db.query(
            Resume, 
            CandidateProfile, 
            ResumeEvaluation
        ).join(
            CandidateProfile, 
            Resume.id == CandidateProfile.resume_id
        ).join(
            ResumeEvaluation,
            and_(
                Resume.id == ResumeEvaluation.resume_id,
                ResumeEvaluation.job_description_id == job_description_id
            )
        ).filter(
            Resume.id == resume_id
        ).first()
        
        if result:
            resume, profile, evaluation = result
            
            # Get skill evaluations
            skill_evals = db.query(SkillEvaluation).filter(
                and_(
                    SkillEvaluation.candidate_profile_id == profile.id,
                    SkillEvaluation.job_description_id == job_description_id
                )
            ).all()
            
            skill_data = [
                {
                    "skill_name": eval.skill_name,
                    "skill_score": eval.skill_score,
                    "skill_level": eval.skill_detected_level
                }
                for eval in skill_evals
            ]
            
            candidates.append({
                "resume_id": resume.id,
                "candidate_name": profile.name,
                "experience_years": profile.experience_years,
                "location": profile.location,
                "skills": profile.skills,
                "education": profile.education,
                "match_scores": {
                    "overall": evaluation.overall_match_score,
                    "experience": evaluation.experience_score,
                    "education": evaluation.education_score,
                    "skills": evaluation.skills_score
                },
                "strengths": evaluation.strengths,
                "weaknesses": evaluation.weaknesses,
                "skill_evaluations": skill_data
            })
    
    # Format job description
    jd_data = {
        "id": job_description.id,
        "title": job_description.title,
        "overview": job_description.overview,
        "responsibilities": job_description.responsibilities,
        "required_qualifications": job_description.required_qualifications,
        "preferred_qualifications": job_description.preferred_qualifications
    }
    
    # Generate comparison metrics
    comparison_metrics = {
        "average_match_score": sum(c["match_scores"]["overall"] for c in candidates) / len(candidates) if candidates else 0,
        "highest_match_score": max(c["match_scores"]["overall"] for c in candidates) if candidates else 0,
        "lowest_match_score": min(c["match_scores"]["overall"] for c in candidates) if candidates else 0,
        "total_candidates": len(candidates),
        "common_strengths": _find_common_elements([c["strengths"] for c in candidates]),
        "common_weaknesses": _find_common_elements([c["weaknesses"] for c in candidates])
    }
    
    return {
        "job_description": jd_data,
        "candidates": candidates,
        "comparison_metrics": comparison_metrics
    }

# Helper function for comparison endpoint
def _find_common_elements(lists):
    """Find elements that appear in multiple lists"""
    if not lists:
        return []
    
    # Flatten the lists and count occurrences
    all_elements = []
    for lst in lists:
        if lst:
            all_elements.extend(lst)
    
    # Count occurrences
    element_counts = {}
    for element in all_elements:
        element_counts[element] = element_counts.get(element, 0) + 1
    
    # Find elements that appear in at least half of the lists
    threshold = max(1, len(lists) // 2)
    common_elements = [element for element, count in element_counts.items() if count >= threshold]
    
    return common_elements
