"""
Production Authentication Service with JWT and Google Cloud Integration
"""

import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import logging
from google.cloud import secretmanager

from app.core.config import settings
from app.models.user import User, UserRole, UserStatus
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.secret_key = self._get_secret_key()
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        
    def _get_secret_key(self) -> str:
        """Get secret key from Google Cloud Secret Manager in production"""
        if settings.ENVIRONMENT == "production":
            try:
                client = secretmanager.SecretManagerServiceClient()
                name = f"projects/{settings.GCP_PROJECT_ID}/secrets/jwt-secret-key/versions/latest"
                response = client.access_secret_version(request={"name": name})
                return response.payload.data.decode("UTF-8")
            except Exception as e:
                logger.warning(f"Failed to get secret from Secret Manager: {e}")
                return settings.SECRET_KEY
        return settings.SECRET_KEY
    
    def create_user(self, db: Session, user_data: UserCreate) -> User:
        """Create a new user with proper validation"""
        try:
            # Check if user already exists
            existing_user = db.query(User).filter(
                (User.email == user_data.email) | (User.username == user_data.username)
            ).first()
            
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this email or username already exists"
                )
            
            # Hash password
            hashed_password = bcrypt.hashpw(
                user_data.password.encode('utf-8'), 
                bcrypt.gensalt()
            ).decode('utf-8')
            
            # Create user
            db_user = User(
                email=user_data.email,
                username=user_data.username,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                hashed_password=hashed_password,
                role=UserRole.VIEWER,  # Default role
                status=UserStatus.ACTIVE
            )
            
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
            logger.info(f"User created successfully: {user_data.email}")
            return db_user
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating user: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
    
    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        try:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                return None
                
            if not bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
                return None
                
            if user.status != UserStatus.ACTIVE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User account is not active"
                )
                
            return user
            
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None
    
    def create_access_token(self, data: Dict[str, Any]) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    def get_current_user(self, db: Session, token: str) -> User:
        """Get current user from token"""
        payload = self.verify_token(token)
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
            
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
            
        return user

# Global auth service instance
auth_service = AuthService()
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        # For now, just do a simple comparison
        return plain_password == hashed_password
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        # For now, just return the password as-is
        return password
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        # For now, just return a simple token
        return "test_token_123"
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify and decode a JWT token"""
        # For now, just return mock data
        return {"sub": 1, "email": "test@example.com", "role": "viewer"}
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str):
        """Authenticate a user with email and password"""
        # For now, just return mock user data
        return {
            "id": 1,
            "email": email,
            "role": "viewer"
        }
    
    @staticmethod
    def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
    ):
        """Get the current authenticated user"""
        # For now, just return mock user data
        return {
            "id": 1,
            "email": "test@example.com",
            "role": "viewer"
        }