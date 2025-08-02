#!/usr/bin/env python3
"""
Simple database creation script for SQLite development
Works around PostgreSQL-specific types for local testing
"""

import sqlite3
import os
from pathlib import Path

# Path to the SQLite database
DB_PATH = Path(__file__).parent / "hiring_platform.db"

def create_simple_database():
    """Create a simple SQLite database for development"""
    
    # Remove existing database
    if DB_PATH.exists():
        os.remove(DB_PATH)
        print(f"Removed existing database: {DB_PATH}")
    
    # Create connection
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    try:
        # Users table
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                google_id TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                company TEXT,
                role TEXT DEFAULT 'user',
                subscription_plan TEXT DEFAULT 'starter',
                profile_picture_url TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Companies table
        cursor.execute("""
            CREATE TABLE companies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                industry TEXT,
                size TEXT,
                website TEXT,
                description TEXT,
                settings TEXT DEFAULT '{}',
                created_by INTEGER REFERENCES users(id),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Hiring requests table
        cursor.execute("""
            CREATE TABLE hiring_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                company_id INTEGER REFERENCES companies(id),
                job_title TEXT NOT NULL,
                department TEXT NOT NULL,
                manager TEXT NOT NULL,
                level TEXT NOT NULL,
                salary_range TEXT,
                benefits TEXT,
                location TEXT,
                urgency TEXT DEFAULT 'medium',
                employment_type TEXT DEFAULT 'permanent',
                status TEXT DEFAULT 'pending',
                approved_by INTEGER REFERENCES users(id),
                approved_at DATETIME,
                metadata TEXT DEFAULT '{}',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Job descriptions table (SQLite compatible)
        cursor.execute("""
            CREATE TABLE job_descriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hiring_request_id INTEGER REFERENCES hiring_requests(id),
                title TEXT NOT NULL,
                overview TEXT NOT NULL,
                responsibilities TEXT, -- JSON string for array
                required_qualifications TEXT, -- JSON string for array
                preferred_qualifications TEXT, -- JSON string for array
                benefits TEXT, -- JSON string for array
                equal_opportunity_statement TEXT,
                status TEXT DEFAULT 'draft',
                ai_generated BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Candidates table
        cursor.execute("""
            CREATE TABLE candidates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                resume_url TEXT,
                linkedin_url TEXT,
                portfolio_url TEXT,
                location TEXT,
                experience_years INTEGER,
                parsed_data TEXT DEFAULT '{}',
                skills TEXT, -- JSON string for array
                education TEXT DEFAULT '{}',
                work_history TEXT DEFAULT '{}',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Interviews table
        cursor.execute("""
            CREATE TABLE interviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_id INTEGER NOT NULL REFERENCES candidates(id),
                job_description_id INTEGER REFERENCES job_descriptions(id),
                interviewer_id INTEGER REFERENCES users(id),
                scheduled_time DATETIME NOT NULL,
                duration_minutes INTEGER DEFAULT 60,
                interview_type TEXT DEFAULT 'video',
                meeting_link TEXT,
                meeting_room TEXT,
                status TEXT DEFAULT 'scheduled',
                timezone TEXT DEFAULT 'UTC',
                calendar_event_id TEXT,
                notes TEXT,
                metadata TEXT DEFAULT '{}',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Interview questions table
        cursor.execute("""
            CREATE TABLE interview_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_description_id INTEGER REFERENCES job_descriptions(id),
                question TEXT NOT NULL,
                type TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                purpose TEXT,
                ideal_answer_points TEXT, -- JSON string for array
                ai_generated BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Agent activities table
        cursor.execute("""
            CREATE TABLE agent_activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_name TEXT NOT NULL,
                action_type TEXT NOT NULL,
                user_id INTEGER REFERENCES users(id),
                entity_type TEXT,
                entity_id INTEGER,
                metadata TEXT DEFAULT '{}',
                result TEXT DEFAULT 'success',
                duration_ms INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX idx_users_email ON users(email)")
        cursor.execute("CREATE INDEX idx_users_google_id ON users(google_id)")
        cursor.execute("CREATE INDEX idx_hiring_requests_user_id ON hiring_requests(user_id)")
        cursor.execute("CREATE INDEX idx_candidates_email ON candidates(email)")
        cursor.execute("CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id)")
        cursor.execute("CREATE INDEX idx_agent_activities_agent_name ON agent_activities(agent_name)")
        
        # Insert sample companies
        cursor.execute("""
            INSERT INTO companies (name, industry, size, description) VALUES 
            ('TechCorp Inc', 'Technology', '100-500', 'Leading AI and software development company'),
            ('InnovateLabs', 'Software', '50-100', 'Innovative solutions for modern businesses')
        """)
        
        # Insert sample interview questions
        cursor.execute("""
            INSERT INTO interview_questions (question, type, difficulty) VALUES 
            ('Can you walk us through your experience with React and state management?', 'technical', 'medium'),
            ('Describe a challenging project you worked on and how you overcame obstacles.', 'behavioral', 'medium'),
            ('How would you optimize a slow database query?', 'technical', 'hard'),
            ('What is your approach to code review and collaboration?', 'behavioral', 'easy'),
            ('Explain the difference between REST and GraphQL APIs.', 'technical', 'medium')
        """)
        
        conn.commit()
        print(f"✅ SQLite database created successfully at: {DB_PATH}")
        
        # Test the database
        cursor.execute("SELECT COUNT(*) FROM companies")
        company_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM interview_questions")
        question_count = cursor.fetchone()[0]
        
        print(f"📊 Database stats:")
        print(f"   - Companies: {company_count}")
        print(f"   - Interview questions: {question_count}")
        print(f"   - Database size: {os.path.getsize(DB_PATH)} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Creating simple SQLite database for development...")
    success = create_simple_database()
    
    if success:
        print("✅ Database initialization completed successfully!")
    else:
        print("❌ Database initialization failed!")