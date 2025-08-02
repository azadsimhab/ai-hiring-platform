from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
import time
import hashlib
from google.oauth2 import id_token
from google.auth.transport import requests
import jwt
from datetime import datetime, timedelta
import os

from app.core.config import settings
from app.middleware.security import security_middleware

# OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
JWT_SECRET = os.getenv("JWT_SECRET")

# Configure logging
if settings.ENVIRONMENT == "production":
    try:
        from google.cloud import logging as cloud_logging
        client = cloud_logging.Client()
        client.setup_logging()
    except ImportError:
        # Fallback to standard logging if Google Cloud logging is not available
        logging.basicConfig(
            level=getattr(logging, settings.LOG_LEVEL),
            format=settings.LOG_FORMAT
        )
else:
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL),
        format=settings.LOG_FORMAT
    )

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events with security initialization"""
    # Startup
    logger.info("Starting AI Hiring Platform API with enhanced security...")
    
    try:
        # Initialize database
        from app.database import init_db
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        if settings.ENVIRONMENT == "production":
            raise
    
    # Initialize GCP services
    try:
        from app.services.gcp_service import initialize_gcp_services
        initialize_gcp_services()
        logger.info("GCP services initialized successfully")
    except Exception as e:
        logger.error(f"GCP services initialization failed: {e}")
        if settings.ENVIRONMENT == "production":
            raise
    
    # Initialize security services
    try:
        from app.services.anti_cheat_service import anti_cheat_service
        logger.info("Security services initialized successfully")
    except Exception as e:
        logger.error(f"Security services initialization failed: {e}")
        if settings.ENVIRONMENT == "production":
            raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Hiring Platform API...")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Hiring Platform API with advanced security features",
    version=settings.VERSION,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan
)

# Add security middleware for production
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["hiring-platform.com", "www.hiring-platform.com", "*.run.app"]
    )
else:
    # Skip host validation in development
    pass

# Add CORS middleware with security
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page-Count"],
)

# Add custom security middleware
@app.middleware("http")
async def security_middleware_handler(request: Request, call_next):
    return await security_middleware(request, call_next)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to the AI Hiring Platform API",
        "status": "running",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "security": "enhanced"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "security_status": "active"
    }

# Security status endpoint
@app.get("/security/status")
async def security_status():
    return {
        "security_enabled": True,
        "anti_cheat_active": True,
        "input_validation": True,
        "rate_limiting": True,
        "csrf_protection": True,
        "xss_protection": True,
        "monitoring_active": settings.ENVIRONMENT == "production"
    }

# Google OAuth endpoint
@app.post("/api/v1/auth/google")
async def google_oauth_login(request: dict):
    """Production Google OAuth endpoint"""
    try:
        token = request.get("credential")
        
        # Verify Google ID token
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), GOOGLE_CLIENT_ID
        )
        
        # Extract user information
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo['name']
        picture = idinfo.get('picture', '')
        
        # Create or update user in database
        user = await get_or_create_user(
            google_id=google_id,
            email=email,
            name=name,
            picture=picture
        )
        
        # Generate JWT token
        payload = {
            "user_id": user.id,
            "email": email,
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        jwt_token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        
        return {
            "success": True,
            "user": {
                "id": user.id,
                "email": email,
                "name": name,
                "picture": picture
            },
            "token": jwt_token
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid token: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication failed: {e}")

async def get_or_create_user(google_id: str, email: str, name: str, picture: str):
    """Get existing user or create new one"""
    from app.database import get_db
    from app.models.user import User
    
    db = next(get_db())
    
    # Check if user exists
    user = db.query(User).filter(
        (User.google_id == google_id) | (User.email == email)
    ).first()
    
    if user:
        # Update existing user
        user.name = name
        user.picture = picture
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
    else:
        # Create new user
        new_user = User(
            google_id=google_id,
            email=email,
            name=name,
            picture=picture,
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow(),
            subscription_plan='free_trial',
            trial_ends_at=datetime.utcnow() + timedelta(days=14)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

# Import routes with detailed error handling
logger.info("Starting to load routes...")

# Load all routes
route_modules = [
    ("auth", "authentication"),
    ("hiring_requests", "hiring-requests"),
    ("jd_generator", "jd-generator"),
    ("resume_scanner", "resume-scanner"),
    ("multimodal_screening", "multimodal-screening"),
    ("coding_test", "coding-test"),
    ("ai", "ai-services")
]

for module_name, tag in route_modules:
    try:
        logger.info(f"Attempting to import {module_name} routes...")
        module = __import__(f"app.api.routes.{module_name}", fromlist=["router"])
        logger.info(f"{module_name} module imported successfully")
        
        app.include_router(
            module.router,
            prefix=f"{settings.API_V1_STR}/{module_name.replace('_', '-')}",
            tags=[tag]
        )
        logger.info(f"{module_name} routes loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load {module_name} routes: {e}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")

# Add Google OAuth router
try:
    from app.api.routes import google_oauth
    app.include_router(
        google_oauth.router,
        prefix="/api/v1/auth",
        tags=["authentication"]
    )
    logger.info("Google OAuth routes loaded successfully")
except Exception as e:
    logger.error(f"Failed to load Google OAuth routes: {e}")
    import traceback
    logger.error(f"Full traceback: {traceback.format_exc()}")

logger.info("Route loading completed")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    
    if settings.ENVIRONMENT == "production":
        return {
            "detail": "Internal server error",
            "error_id": hashlib.md5(str(time.time()).encode()).hexdigest()[:8]
        }
    else:
        return {
            "detail": str(exc),
            "type": type(exc).__name__
        }
