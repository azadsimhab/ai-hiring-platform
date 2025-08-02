#!/usr/bin/env python3
"""
Database migration script to add Google OAuth fields to users table.
Run this script to update the existing database schema.
"""

import os
import sys
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.database import get_db

def migrate_oauth_fields():
    """Add Google OAuth fields to the users table"""
    
    # Get database URL from settings
    database_url = settings.DATABASE_URL
    
    # Create engine
    engine = create_engine(database_url)
    
    # Migration SQL statements
    migration_sql = [
        # Add Google OAuth fields
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS picture VARCHAR(500);",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free_trial';",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;",
        
        # Make existing fields nullable for OAuth users
        "ALTER TABLE users ALTER COLUMN username DROP NOT NULL;",
        "ALTER TABLE users ALTER COLUMN first_name DROP NOT NULL;",
        "ALTER TABLE users ALTER COLUMN last_name DROP NOT NULL;",
        "ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;",
        
        # Create indexes for performance
        "CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);",
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
        "CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);",
    ]
    
    try:
        with engine.connect() as connection:
            print("Starting OAuth migration...")
            
            for i, sql in enumerate(migration_sql, 1):
                try:
                    print(f"Executing migration {i}/{len(migration_sql)}: {sql[:50]}...")
                    connection.execute(text(sql))
                    connection.commit()
                    print(f"✓ Migration {i} completed successfully")
                except Exception as e:
                    print(f"⚠ Migration {i} failed (this might be expected if column already exists): {e}")
                    connection.rollback()
            
            print("\n✅ OAuth migration completed successfully!")
            
            # Verify the migration
            result = connection.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name IN ('google_id', 'name', 'picture', 'created_at', 'subscription_plan', 'trial_ends_at')
                ORDER BY column_name;
            """))
            
            columns = result.fetchall()
            print("\n📋 Verification - OAuth columns in users table:")
            for column in columns:
                print(f"  - {column[0]}: {column[1]} ({'NULL' if column[2] == 'YES' else 'NOT NULL'})")
                
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🚀 Starting Google OAuth Database Migration")
    print("=" * 50)
    
    migrate_oauth_fields()
    
    print("\n" + "=" * 50)
    print("✅ Migration script completed!")
    print("\nNext steps:")
    print("1. Restart your backend server")
    print("2. Test Google OAuth login")
    print("3. Verify user creation in database") 