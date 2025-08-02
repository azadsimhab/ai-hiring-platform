#!/usr/bin/env python3
"""
Database initialization script for AI Hiring Platform
Handles both development (SQLite) and production (PostgreSQL) databases
"""

import os
import sys
import asyncio
import logging
from pathlib import Path

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent))

try:
    from app.core.config import settings
    from app.database import engine, SessionLocal
    from sqlalchemy import create_engine, text
    
    try:
        import asyncpg
        ASYNCPG_AVAILABLE = True
    except ImportError:
        print("Warning: asyncpg not available. PostgreSQL functionality will be limited.")
        ASYNCPG_AVAILABLE = False
        
except ImportError as e:
    print(f"Error importing app modules: {e}")
    print("Make sure you're running from the backend directory and have installed dependencies")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_sqlite_database():
    """Initialize SQLite database for development"""
    try:
        from app.models import Base
        
        logger.info("Creating SQLite database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Insert sample data
        from sqlalchemy.orm import Session
        db = SessionLocal()
        
        try:
            # Insert sample companies
            from app.models.company import Company
            existing_companies = db.query(Company).count()
            
            if existing_companies == 0:
                companies = [
                    Company(
                        name="TechCorp Inc", 
                        industry="Technology", 
                        size="100-500",
                        description="Leading AI and software development company"
                    ),
                    Company(
                        name="InnovateLabs", 
                        industry="Software", 
                        size="50-100",
                        description="Innovative solutions for modern businesses"
                    )
                ]
                
                for company in companies:
                    db.add(company)
                
                db.commit()
                logger.info("Sample companies inserted successfully")
            else:
                logger.info("Companies already exist, skipping sample data")
                
        except Exception as e:
            logger.error(f"Error inserting sample data: {e}")
            db.rollback()
        finally:
            db.close()
            
        logger.info("SQLite database initialized successfully!")
        return True
        
    except Exception as e:
        logger.error(f"SQLite database initialization failed: {e}")
        return False

async def init_postgresql_database():
    """Initialize PostgreSQL database for production"""
    if not ASYNCPG_AVAILABLE:
        logger.error("asyncpg not available - cannot initialize PostgreSQL database")
        logger.info("For PostgreSQL support, install: pip install asyncpg")
        return False
        
    try:
        # Parse database URL
        db_url = settings.DATABASE_URL
        if not db_url or not db_url.startswith('postgresql'):
            logger.error("Invalid PostgreSQL database URL")
            return False
            
        # Extract connection details
        import urllib.parse as urlparse
        parsed = urlparse.urlparse(db_url)
        
        # Connect to PostgreSQL server (not specific database)
        server_url = f"postgresql://{parsed.username}:{parsed.password}@{parsed.hostname}:{parsed.port or 5432}/postgres"
        
        try:
            conn = await asyncpg.connect(server_url)
            
            # Check if database exists
            db_name = parsed.path[1:]  # Remove leading slash
            exists = await conn.fetchval(
                "SELECT 1 FROM pg_database WHERE datname = $1", db_name
            )
            
            if not exists:
                logger.info(f"Creating database: {db_name}")
                await conn.execute(f'CREATE DATABASE "{db_name}"')
            else:
                logger.info(f"Database {db_name} already exists")
                
            await conn.close()
            
        except Exception as e:
            logger.warning(f"Could not create database (may already exist): {e}")
        
        # Now connect to the actual database and run schema
        logger.info("Connecting to database and running schema...")
        
        # Read and execute the production schema
        schema_path = Path(__file__).parent / "database" / "production_schema.sql"
        if not schema_path.exists():
            logger.error("production_schema.sql not found")
            return False
            
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Connect to the target database
        conn = await asyncpg.connect(db_url)
        
        try:
            # Execute schema in a transaction
            async with conn.transaction():
                await conn.execute(schema_sql)
            
            logger.info("PostgreSQL database schema applied successfully!")
            
            # Test the connection
            result = await conn.fetchval("SELECT COUNT(*) FROM users")
            logger.info(f"Database connection test successful. Users table has {result} records.")
            
        except Exception as e:
            logger.error(f"Error applying schema: {e}")
            return False
        finally:
            await conn.close()
            
        return True
        
    except Exception as e:
        logger.error(f"PostgreSQL database initialization failed: {e}")
        return False

def test_database_connection():
    """Test database connection and basic operations"""
    try:
        logger.info("Testing database connection...")
        
        if settings.DATABASE_URL and settings.DATABASE_URL.startswith('postgresql'):
            # Test PostgreSQL connection
            if ASYNCPG_AVAILABLE:
                import asyncio
                async def test_pg():
                    conn = await asyncpg.connect(settings.DATABASE_URL)
                    result = await conn.fetchval("SELECT version()")
                    await conn.close()
                    return result
                
                version = asyncio.run(test_pg())
                logger.info(f"PostgreSQL connection successful: {version}")
            else:
                logger.warning("Cannot test PostgreSQL connection - asyncpg not available")
        else:
            # Test SQLite connection
            from sqlalchemy import create_engine
            test_engine = create_engine(settings.DATABASE_URL)
            with test_engine.connect() as conn:
                result = conn.execute(text("SELECT sqlite_version()")).fetchone()
                logger.info(f"SQLite connection successful: {result[0]}")
        
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False

def main():
    """Main initialization function"""
    logger.info("Starting database initialization...")
    logger.info(f"Database URL: {settings.DATABASE_URL}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    success = False
    
    if settings.DATABASE_URL and settings.DATABASE_URL.startswith('postgresql'):
        logger.info("Initializing PostgreSQL database...")
        success = asyncio.run(init_postgresql_database())
    else:
        logger.info("Initializing SQLite database...")
        success = init_sqlite_database()
    
    if success:
        logger.info("Testing database connection...")
        success = test_database_connection()
    
    if success:
        logger.info("✅ Database initialization completed successfully!")
        sys.exit(0)
    else:
        logger.error("❌ Database initialization failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()