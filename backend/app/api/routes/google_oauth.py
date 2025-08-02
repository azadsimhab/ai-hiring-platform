from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import jwt
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User, UserRole, UserStatus
from app.schemas.google_oauth import GoogleOAuthRequest, AuthResponse, UserResponse
from fastapi.security import HTTPBearer

router = APIRouter()

# OAuth2 scheme for token extraction
oauth2_scheme = HTTPBearer()

# Google OAuth client ID from environment
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "1059515914490-mror8dqhgdgi2qaoeidrqulfr8ml7f0j.apps.googleusercontent.com")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "2085f921c4fb34ce3b91da412003a82e")

if not GOOGLE_CLIENT_ID:
    print("WARNING: GOOGLE_CLIENT_ID not set in environment variables")

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm="HS256")
    return encoded_jwt

@router.post("/google", response_model=AuthResponse)
async def google_oauth(
    oauth_request: dict,
    db: Session = Depends(get_db)
):
    """
    Production Google OAuth endpoint
    Handles both ID tokens and access tokens with user info
    """
    try:
        if not GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=500, 
                detail="Google OAuth not configured on server"
            )
        
        # Handle different OAuth flows
        if 'user_info' in oauth_request:
            # Access token flow with user info
            user_info = oauth_request['user_info']
            google_id = user_info['id']
            email = user_info['email']
            name = user_info['name']
            picture = user_info.get('picture', '')
        else:
            # ID token flow
            credential = oauth_request.get('credential')
            if not credential:
                raise HTTPException(status_code=400, detail="No credential provided")
                
            # Verify the Google ID token
            idinfo = id_token.verify_oauth2_token(
                credential, 
                requests.Request(), 
                GOOGLE_CLIENT_ID
            )
            
            google_id = idinfo['sub']
            email = idinfo['email']
            name = idinfo['name']
            picture = idinfo.get('picture', '')
        
        print(f"OAuth Success: {email} ({name}) authenticated")
        
        # Validate required fields
        if not google_id or not email or not name:
            raise HTTPException(
                status_code=400,
                detail="Invalid Google token: missing required user information"
            )

        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.google_id == google_id) | (User.email == email)
        ).first()

        if existing_user:
            # Update existing user
            existing_user.google_id = google_id
            existing_user.name = name
            existing_user.email = email
            existing_user.picture = picture
            existing_user.last_login = datetime.utcnow()
            existing_user.status = UserStatus.ACTIVE
            db.commit()
            db.refresh(existing_user)
            user = existing_user
        else:
            # Create new user
            user = User(
                google_id=google_id,
                email=email,
                name=name,
                picture=picture,
                role=UserRole.VIEWER,
                subscription_plan="starter",
                status=UserStatus.ACTIVE,
                last_login=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Generate access token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )

        # Return success response
        return AuthResponse(
            success=True,
            token=access_token,
            user=UserResponse(
                id=str(user.id),
                name=user.name,
                email=user.email,
                company=getattr(user, 'company', None),
                google_id=user.google_id,
                role=str(user.role) if hasattr(user.role, 'value') else str(user.role),
                profile_picture_url=user.picture
            )
        )

    except ValueError as e:
        # Invalid Google token
        raise HTTPException(
            status_code=400,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        # Server error
        raise HTTPException(
            status_code=500,
            detail=f"Authentication failed: {str(e)}"
        )

def get_current_user_dependency(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """Dependency to get current user from JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
            
        return user
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_current_user_dependency)
):
    """Get current authenticated user information"""
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        company=getattr(current_user, 'company', None),
        google_id=current_user.google_id,
        role=str(current_user.role) if hasattr(current_user.role, 'value') else str(current_user.role),
        profile_picture_url=current_user.picture
    )