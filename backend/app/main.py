from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
import time
import hashlib

from app.core.config import settings
from app.middleware.security import security_middleware

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
