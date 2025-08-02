#!/usr/bin/env python3
"""
Production Database Initialization Script
Creates a clean, production-ready database schema
"""

import os
import sys
import logging
from pathlib import Path

# Add the project root to Python path
sys.path.append(str(Path(__file__).parent))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    """Main initialization function"""
    try:
        logger.info("Starting production database initialization...")
        
        # Import after path setup
        from sqlalchemy import create_engine, MetaData
        from sqlalchemy.orm import declarative_base, sessionmaker
        
        # Database configuration
        DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hiring_platform_production.db")
        
        # Remove existing database file for clean start
        if DATABASE_URL.startswith("sqlite"):
            db_file = DATABASE_URL.replace("sqlite:///", "")
            if os.path.exists(db_file):
                os.remove(db_file)
                logger.info(f"Removed existing database: {db_file}")
        
        # Create engine
        if DATABASE_URL.startswith("postgresql"):
            engine = create_engine(DATABASE_URL, pool_pre_ping=True)
            logger.info("Using PostgreSQL database")
        else:
            engine = create_engine(
                DATABASE_URL,
                connect_args={"check_same_thread": False}
            )
            logger.info("Using SQLite database")
        
        # Create base and session
        Base = declarative_base()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Import and create production models
        from app.core.database_types import JSONList, JSONDict
        from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
        from sqlalchemy.sql import func
        
        class User(Base):
            __tablename__ = "users"
            
            id = Column(Integer, primary_key=True, index=True)
            google_id = Column(String(255), unique=True, nullable=False, index=True)
            email = Column(String(255), unique=True, nullable=False, index=True)
            name = Column(String(255), nullable=False)
            profile_picture_url = Column(Text, nullable=True)
            company = Column(String(255), nullable=True)
            role = Column(String(50), nullable=False, default="user")
            subscription_plan = Column(String(50), nullable=False, default="starter")
            is_active = Column(Boolean, nullable=False, default=True)
            last_login = Column(DateTime(timezone=True), nullable=True)
            preferences = Column(JSONDict, nullable=False, default={})
            created_at = Column(DateTime(timezone=True), server_default=func.now())
            updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
        
        class Company(Base):
            __tablename__ = "companies"
            
            id = Column(Integer, primary_key=True, index=True)
            name = Column(String(255), nullable=False)
            industry = Column(String(100), nullable=True)
            size = Column(String(50), nullable=True)
            website = Column(String(255), nullable=True)
            description = Column(Text, nullable=True)
            settings = Column(JSONDict, nullable=False, default={})
            created_at = Column(DateTime(timezone=True), server_default=func.now())
            updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
        
        class HiringRequest(Base):
            __tablename__ = "hiring_requests"
            
            id = Column(Integer, primary_key=True, index=True)
            user_id = Column(Integer, nullable=False, index=True)
            company_id = Column(Integer, nullable=True, index=True)
            job_title = Column(String(255), nullable=False)
            department = Column(String(100), nullable=False)
            manager = Column(String(255), nullable=False)
            level = Column(String(50), nullable=False)
            salary_range = Column(String(100), nullable=True)
            location = Column(String(255), nullable=True)
            status = Column(String(50), nullable=False, default="pending")
            urgency = Column(String(20), nullable=False, default="medium")
            employment_type = Column(String(50), nullable=False, default="permanent")
            request_metadata = Column(JSONDict, nullable=False, default={})
            created_at = Column(DateTime(timezone=True), server_default=func.now())
            updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
        
        class JobDescription(Base):
            __tablename__ = "job_descriptions"
            
            id = Column(Integer, primary_key=True, index=True)
            hiring_request_id = Column(Integer, nullable=True, index=True)
            title = Column(String(255), nullable=False)
            overview = Column(Text, nullable=False)
            responsibilities = Column(JSONList, nullable=False, default=[])
            required_qualifications = Column(JSONList, nullable=False, default=[])
            preferred_qualifications = Column(JSONList, nullable=False, default=[])
            benefits = Column(JSONList, nullable=False, default=[])
            status = Column(String(50), nullable=False, default="draft")
            ai_generated = Column(Boolean, default=False)
            created_at = Column(DateTime(timezone=True), server_default=func.now())
            updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
        
        class Candidate(Base):
            __tablename__ = "candidates"
            
            id = Column(Integer, primary_key=True, index=True)
            name = Column(String(255), nullable=False)
            email = Column(String(255), unique=True, nullable=False, index=True)
            phone = Column(String(50), nullable=True)
            resume_url = Column(Text, nullable=True)
            linkedin_url = Column(Text, nullable=True)
            location = Column(String(255), nullable=True)
            experience_years = Column(Integer, nullable=True)
            skills = Column(JSONList, nullable=False, default=[])
            parsed_data = Column(JSONDict, nullable=False, default={})
            created_at = Column(DateTime(timezone=True), server_default=func.now())
            updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
        
        class Interview(Base):
            __tablename__ = "interviews"
            
            id = Column(Integer, primary_key=True, index=True)
            candidate_id = Column(Integer, nullable=False, index=True)
            job_description_id = Column(Integer, nullable=True, index=True)
            interviewer_id = Column(Integer, nullable=True, index=True)
            scheduled_time = Column(DateTime(timezone=True), nullable=False)
            duration_minutes = Column(Integer, default=60)
            interview_type = Column(String(50), default="video")
            meeting_link = Column(Text, nullable=True)
            status = Column(String(50), default="scheduled")
            notes = Column(Text, nullable=True)
            request_metadata = Column(JSONDict, nullable=False, default={})
            created_at = Column(DateTime(timezone=True), server_default=func.now())
            updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
        
        class AgentActivity(Base):
            __tablename__ = "agent_activities"
            
            id = Column(Integer, primary_key=True, index=True)
            agent_name = Column(String(50), nullable=False, index=True)
            action_type = Column(String(100), nullable=False)
            user_id = Column(Integer, nullable=True, index=True)
            entity_type = Column(String(50), nullable=True)
            entity_id = Column(Integer, nullable=True)
            request_metadata = Column(JSONDict, nullable=False, default={})
            result = Column(String(20), default="success")
            duration_ms = Column(Integer, nullable=True)
            timestamp = Column(DateTime(timezone=True), server_default=func.now())
        
        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Add sample data
        logger.info("Adding sample data...")
        db = SessionLocal()
        
        try:
            # Sample companies
            company1 = Company(
                name="TechCorp Inc",
                industry="Technology",
                size="100-500",
                description="Leading AI and software development company"
            )
            company2 = Company(
                name="InnovateLabs",
                industry="Software",
                size="50-100",
                description="Innovative solutions for modern businesses"
            )
            
            db.add(company1)
            db.add(company2)
            db.commit()
            
            # Sample user
            sample_user = User(
                google_id="demo_123456789",
                email="demo@techcorp.com",
                name="Jane Smith",
                company="TechCorp Inc",
                role="hr_manager",
                subscription_plan="professional",
                preferences={"theme": "dark", "notifications": True}
            )
            
            db.add(sample_user)
            db.commit()
            
            logger.info(f"Sample user created with ID: {sample_user.id}")
            
        except Exception as e:
            logger.error(f"Error adding sample data: {e}")
            db.rollback()
        finally:
            db.close()
        
        # Test database
        logger.info("Testing database connection...")
        db = SessionLocal()
        try:
            user_count = db.query(User).count()
            company_count = db.query(Company).count()
            
            logger.info(f"Database contains {user_count} users and {company_count} companies")
            
            # Get database info
            from sqlalchemy import text
            if DATABASE_URL.startswith("postgresql"):
                version = db.execute(text("SELECT version()")).fetchone()[0]
                logger.info(f"PostgreSQL: {version}")
            else:
                version = db.execute(text("SELECT sqlite_version()")).fetchone()[0]
                logger.info(f"SQLite version: {version}")
                
                # File size
                if os.path.exists(db_file):
                    size = os.path.getsize(db_file)
                    logger.info(f"Database file size: {size} bytes")
            
            logger.info("Production database initialization completed successfully!")
            return True
            
        except Exception as e:
            logger.error(f"Database test failed: {e}")
            return False
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("SUCCESS: Production database ready!")
    else:
        print("FAILED: Database initialization failed!")
        sys.exit(1)