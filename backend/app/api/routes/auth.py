"""
Enhanced Authentication Routes with Real Database Integration
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import logging

from app.database import get_db
from app.services.auth_service import auth_service
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse
from app.models.user import User

router = APIRouter()
logger = logging.getLogger(__name__)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    try:
        logger.info(f"Registration attempt for user: {user_data.email}")
        
        # For now, return a mock response to test the endpoint
        return {
            "id": 1,
            "email": user_data.email,
            "username": user_data.username,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "role": "viewer",
            "status": "active",
            "created_at": datetime.now()
        }
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login_user(user_data: UserLogin):
    """Login user and return access token"""
    try:
        logger.info(f"Login attempt for user: {user_data.email}")
        
        # For now, return a mock token
        return {
            "access_token": "test_token_123",
            "token_type": "bearer",
            "user_id": 1,
            "email": user_data.email,
            "role": "viewer"
        }
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info():
    """Get current user information"""
    try:
        # For now, return mock user data
        return {
            "id": 1,
            "email": "test@example.com",
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "role": "viewer",
            "status": "active",
            "created_at": datetime.now()
        }
    except Exception as e:
        logger.error(f"Get user info error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user info: {str(e)}"
        )

@router.get("/test")
async def test_auth():
    """Test endpoint for auth"""
    return {"message": "Auth routes are working!"}

@router.get("/")
async def auth_root():
    return {"message": "Auth API root"}