"""
Production-ready database configuration and initialization
Supports both PostgreSQL (production) and SQLite (development)
"""

import os
import logging
from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from typing import Generator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database URL from environment or default to SQLite
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./hiring_platform_production.db"
)

# Create engine with appropriate configuration
if DATABASE_URL.startswith("postgresql"):
    # PostgreSQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False  # Set to True for SQL debugging
    )
    logger.info("Using PostgreSQL database")
else:
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={
            "check_same_thread": False,
            "timeout": 30
        },
        poolclass=StaticPool,
        echo=False  # Set to True for SQL debugging
    )
    logger.info("Using SQLite database")

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get DB session
def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency for FastAPI
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """
    Context manager for database operations outside FastAPI
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_production_database():
    """
    Initialize production database with all tables
    """
    try:
        # Import all models to register them with Base
        from app.models.user_production import User
        from app.models.jd_generator import JobDescription, InterviewQuestion
        # Import other models as they're updated...
        
        logger.info("Creating database tables...")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        logger.info("Database tables created successfully")
        
        # Add sample data for development
        if not DATABASE_URL.startswith("postgresql"):
            _add_sample_data()
        
        return True
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False

def _add_sample_data():
    """
    Add sample data for development and testing
    """
    try:
        with get_db_context() as db:
            from app.models.user_production import User
            
            # Check if sample data already exists
            existing_user = db.query(User).filter(User.email == "demo@techcorp.com").first()
            if existing_user:
                logger.info("Sample data already exists")
                return
            
            # Create sample user
            sample_user = User(
                google_id="demo_user_123",
                email="demo@techcorp.com",
                name="Demo User",
                company="TechCorp Inc",
                role="hr_manager",
                subscription_plan="professional",
                preferences={
                    "theme": "dark",
                    "timezone": "UTC",
                    "notifications": True
                }
            )
            
            db.add(sample_user)
            db.commit()
            
            logger.info("Sample data added successfully")
            
    except Exception as e:
        logger.error(f"Failed to add sample data: {e}")

def test_database_connection():
    """
    Test database connection and basic operations
    """
    try:
        with get_db_context() as db:
            # Test basic connection
            if DATABASE_URL.startswith("postgresql"):
                result = db.execute(text("SELECT version()")).fetchone()
                logger.info(f"PostgreSQL connection successful: {result[0]}")
            else:
                result = db.execute(text("SELECT sqlite_version()")).fetchone()
                logger.info(f"SQLite connection successful: version {result[0]}")
            
            # Test model operations
            from app.models.user_production import User
            user_count = db.query(User).count()
            logger.info(f"Database contains {user_count} users")
            
            return True
            
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False

def create_tables_if_not_exist():
    """
    Create tables if they don't exist (safe for production)
    """
    try:
        # Import all models
        from app.models.user_production import User
        from app.models.jd_generator import JobDescription, InterviewQuestion
        
        # Create only missing tables
        Base.metadata.create_all(bind=engine, checkfirst=True)
        logger.info("Database schema updated successfully")
        return True
        
    except Exception as e:
        logger.error(f"Schema update failed: {e}")
        return False

def get_database_info():
    """
    Get database information for debugging
    """
    try:
        with get_db_context() as db:
            if DATABASE_URL.startswith("postgresql"):
                # PostgreSQL info
                version = db.execute(text("SELECT version()")).fetchone()[0]
                db_size = db.execute(text("SELECT pg_size_pretty(pg_database_size(current_database()))")).fetchone()[0]
                
                return {
                    "type": "PostgreSQL",
                    "version": version,
                    "size": db_size,
                    "url": DATABASE_URL.replace(DATABASE_URL.split('@')[0].split('://')[1], '***')
                }
            else:
                # SQLite info
                version = db.execute(text("SELECT sqlite_version()")).fetchone()[0]
                
                # Get file size
                import os
                db_file = DATABASE_URL.replace("sqlite:///", "")
                file_size = os.path.getsize(db_file) if os.path.exists(db_file) else 0
                
                return {
                    "type": "SQLite",
                    "version": version,
                    "size": f"{file_size} bytes",
                    "file": db_file
                }
                
    except Exception as e:
        logger.error(f"Failed to get database info: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    # Direct execution for testing
    print("Initializing production database...")
    success = init_production_database()
    
    if success:
        print("Testing database connection...")
        test_success = test_database_connection()
        
        if test_success:
            print("✅ Production database ready!")
            info = get_database_info()
            print(f"Database info: {info}")
        else:
            print("❌ Database connection test failed!")
    else:
        print("❌ Database initialization failed!")