from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.base import Base
import logging

logger = logging.getLogger(__name__)

# Create database engine with Google Cloud SQL configuration
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.ENVIRONMENT == "development",
    # Google Cloud SQL specific settings
    connect_args={
        "connect_timeout": 10,
        "application_name": "ai-hiring-platform"
    }
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    logger.info("Starting database initialization...")
    try:
        logger.info("Importing models...")
        from app.models import (
            Base, User, HiringRequest, Candidate, Interview, 
            CodingTest, JobDescription, InterviewQuestion,
            Resume, CandidateProfile, SkillEvaluation, ResumeEvaluation,
            InterviewSession, InterviewQuestionResponse
        )
        
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Create initial data if needed
        create_initial_data()
        
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        logger.error(f"Full traceback: {e}")
        raise

def create_initial_data():
    """Create initial data for the application"""
    logger.info("Creating initial data...")
    
    db = SessionLocal()
    try:
        # Check if we already have users
        from app.models.user import User
        existing_users = db.query(User).count()
        
        if existing_users == 0:
            logger.info("Creating initial admin user...")
            
            # Create admin user
            admin_user = User(
                email="admin@hiringplatform.com",
                username="admin",
                first_name="Admin",
                last_name="User",
                role="admin",
                status="active"
            )
            admin_user.set_password("admin123")  # Change this in production
            
            db.add(admin_user)
            db.commit()
            
            logger.info("Initial admin user created successfully")
        else:
            logger.info("Users already exist, skipping initial data creation")
            
    except Exception as e:
        logger.error(f"Error creating initial data: {e}")
        db.rollback()
    finally:
        db.close()