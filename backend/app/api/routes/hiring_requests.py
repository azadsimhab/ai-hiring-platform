"""
Enhanced Hiring Requests Routes with Real Database and AI Integration
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from datetime import datetime

from app.database import get_db
from app.services.auth_service import auth_service
from app.services.ai_service import ai_service
from app.models.hiring_request import HiringRequest, HiringRequestStatus, HiringRequestPriority
from app.models.user import User
from app.schemas.hiring_request import (
    HiringRequestCreate,
    HiringRequestUpdate,
    HiringRequestResponse,
    HiringRequestListResponse,
    HiringRequestApproval
)

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[HiringRequestResponse])
async def get_hiring_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[HiringRequestStatus] = None,
    priority: Optional[HiringRequestPriority] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    """Get all hiring requests with filtering"""
    try:
        query = db.query(HiringRequest)
        
        # Apply filters
        if status:
            query = query.filter(HiringRequest.status == status)
        if priority:
            query = query.filter(HiringRequest.priority == priority)
        
        # Apply pagination
        hiring_requests = query.offset(skip).limit(limit).all()
        
        return [
            HiringRequestResponse(
                id=req.id,
                title=req.title,
                description=req.description,
                department=req.department,
                position=req.position,
                status=req.status.value,
                priority=req.priority.value,
                created_at=req.created_at,
                updated_at=req.updated_at
            )
            for req in hiring_requests
        ]
        
    except Exception as e:
        logger.error(f"Error getting hiring requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get hiring requests"
        )

@router.post("/", response_model=HiringRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_hiring_request(
    hiring_request: HiringRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    """Create a new hiring request"""
    try:
        db_hiring_request = HiringRequest(
            title=hiring_request.title,
            description=hiring_request.description,
            department=hiring_request.department,
            position=hiring_request.position,
            priority=hiring_request.priority or HiringRequestPriority.MEDIUM,
            status=HiringRequestStatus.DRAFT,
            created_by=current_user.id,
            budget_range=hiring_request.budget_range,
            timeline_weeks=hiring_request.timeline_weeks,
            required_skills=hiring_request.required_skills,
            preferred_skills=hiring_request.preferred_skills
        )
        
        db.add(db_hiring_request)
        db.commit()
        db.refresh(db_hiring_request)
        
        logger.info(f"Hiring request created: {db_hiring_request.title}")
        
        return HiringRequestResponse(
            id=db_hiring_request.id,
            title=db_hiring_request.title,
            description=db_hiring_request.description,
            department=db_hiring_request.department,
            position=db_hiring_request.position,
            status=db_hiring_request.status.value,
            priority=db_hiring_request.priority.value,
            created_at=db_hiring_request.created_at,
            updated_at=db_hiring_request.updated_at
        )
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating hiring request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create hiring request"
        )

@router.get("/{request_id}", response_model=HiringRequestResponse)
async def get_hiring_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    """Get a specific hiring request by ID"""
    try:
        hiring_request = db.query(HiringRequest).filter(HiringRequest.id == request_id).first()
        
        if not hiring_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hiring request not found"
            )
        
        return HiringRequestResponse(
            id=hiring_request.id,
            title=hiring_request.title,
            description=hiring_request.description,
            department=hiring_request.department,
            position=hiring_request.position,
            status=hiring_request.status.value,
            priority=hiring_request.priority.value,
            created_at=hiring_request.created_at,
            updated_at=hiring_request.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting hiring request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get hiring request"
        )

@router.put("/{request_id}", response_model=HiringRequestResponse)
async def update_hiring_request(
    request_id: int,
    hiring_request_update: HiringRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    """Update a hiring request"""
    try:
        db_hiring_request = db.query(HiringRequest).filter(HiringRequest.id == request_id).first()
        
        if not db_hiring_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hiring request not found"
            )
        
        # Update fields
        update_data = hiring_request_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_hiring_request, field, value)
        
        db.commit()
        db.refresh(db_hiring_request)
        
        logger.info(f"Hiring request updated: {db_hiring_request.title}")
        
        return HiringRequestResponse(
            id=db_hiring_request.id,
            title=db_hiring_request.title,
            description=db_hiring_request.description,
            department=db_hiring_request.department,
            position=db_hiring_request.position,
            status=db_hiring_request.status.value,
            priority=db_hiring_request.priority.value,
            created_at=db_hiring_request.created_at,
            updated_at=db_hiring_request.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating hiring request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update hiring request"
        )

@router.post("/{request_id}/approve", response_model=HiringRequestResponse)
async def approve_hiring_request(
    request_id: int,
    approval: HiringRequestApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth_service.get_current_user)
):
    """Approve a hiring request"""
    try:
        # Check if user has admin role
        if current_user.role.value not in ['admin', 'manager']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        db_hiring_request = db.query(HiringRequest).filter(HiringRequest.id == request_id).first()
        
        if not db_hiring_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hiring request not found"
            )
        
        if db_hiring_request.status != HiringRequestStatus.PENDING_APPROVAL:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hiring request is not pending approval"
            )
        
        # Update status
        db_hiring_request.status = HiringRequestStatus.APPROVED
        db_hiring_request.approved_by = current_user.id
        db_hiring_request.approval_notes = approval.notes
        db_hiring_request.approved_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_hiring_request)
        
        logger.info(f"Hiring request approved: {db_hiring_request.title}")
        
        return HiringRequestResponse(
            id=db_hiring_request.id,
            title=db_hiring_request.title,
            description=db_hiring_request.description,
            department=db_hiring_request.department,
            position=db_hiring_request.position,
            status=db_hiring_request.status.value,
            priority=db_hiring_request.priority.value,
            created_at=db_hiring_request.created_at,
            updated_at=db_hiring_request.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error approving hiring request: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve hiring request"
        ) 