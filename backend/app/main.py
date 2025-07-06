import logging
import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import (
    hiring_requests,
    jd_generator,
    resume_scanner,
    multimodal_screening,
    coding_test,
)
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Hiring Platform API",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware for request logging and timing
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} completed in {process_time:.4f}s")
    return response

# Exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

# Root endpoint
@app.get("/", include_in_schema=False)
async def root():
    return {
        "message": "Welcome to the AI Hiring Platform API",
        "docs": "/api/docs",
    }

# Health check endpoint
@app.get("/health", include_in_schema=False)
async def health_check():
    return {"status": "healthy"}

# Include API routers
app.include_router(
    hiring_requests.router,
    prefix="/api/hiring-requests",
    tags=["Hiring Requests"],
)

app.include_router(
    jd_generator.router,
    prefix="/api/job-descriptions",
    tags=["Job Descriptions"],
)

# Add the new Resume Scanner router
app.include_router(
    resume_scanner.router,
    prefix="/api/resumes",
    tags=["Resume Scanner"],
)

# Add the Multimodal Screening router
app.include_router(
    multimodal_screening.router,
    prefix="/api/screening",
    tags=["Multimodal Screening"],
)

# Add the Coding Test router
app.include_router(
    coding_test.router,
    prefix="/api/coding-tests",
    tags=["Coding Tests"],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up the AI Hiring Platform API")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down the AI Hiring Platform API")
