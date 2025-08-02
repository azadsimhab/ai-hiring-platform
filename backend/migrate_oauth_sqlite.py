#!/usr/bin/env python3
"""
SQLite-compatible database migration script to add Google OAuth fields to users table.
"""

import os
import sys
from sqlalchemy import create_engine, text, inspect
from datetime import datetime, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def migrate_oauth_fields_sqlite():
    """Add Google OAuth fields to the users table for SQLite"""
    
    # Get database URL from settings
    database_url = settings.DATABASE_URL
    
    # Create engine
    engine = create_engine(database_url)
    inspector = inspect(engine)
    
    try:
        with engine.connect() as connection:
            print("Starting SQLite OAuth migration...")
            
            # Get existing columns
            existing_columns = [col['name'] for col in inspector.get_columns('users')]
            print(f"Existing columns: {existing_columns}")
            
            # Define new columns to add
            new_columns = [
                ('google_id', 'VARCHAR(255)'),
                ('name', 'VARCHAR(255)'),
                ('picture', 'VARCHAR(500)'),
                ('created_at', 'TIMESTAMP'),
                ('subscription_plan', 'VARCHAR(50)'),
                ('trial_ends_at', 'TIMESTAMP')
            ]
            
            # Add new columns if they don't exist
            for column_name, column_type in new_columns:
                if column_name not in existing_columns:
                    try:
                        sql = f"ALTER TABLE users ADD COLUMN {column_name} {column_type};"
                        print(f"Adding column: {column_name}")
                        connection.execute(text(sql))
                        connection.commit()
                        print(f"✓ Added column {column_name}")
                    except Exception as e:
                        print(f"⚠ Failed to add column {column_name}: {e}")
                        connection.rollback()
                else:
                    print(f"✓ Column {column_name} already exists")
            
            # Create indexes
            indexes_to_create = [
                ('idx_users_google_id', 'google_id'),
                ('idx_users_email', 'email'),
                ('idx_users_created_at', 'created_at')
            ]
            
            existing_indexes = [idx['name'] for idx in inspector.get_indexes('users')]
            
            for index_name, column_name in indexes_to_create:
                if index_name not in existing_indexes and column_name in existing_columns:
                    try:
                        sql = f"CREATE INDEX {index_name} ON users({column_name});"
                        print(f"Creating index: {index_name}")
                        connection.execute(text(sql))
                        connection.commit()
                        print(f"✓ Created index {index_name}")
                    except Exception as e:
                        print(f"⚠ Failed to create index {index_name}: {e}")
                        connection.rollback()
                else:
                    print(f"✓ Index {index_name} already exists or column not available")
            
            print("\n✅ SQLite OAuth migration completed successfully!")
            
            # Verify the migration by checking columns
            final_columns = [col['name'] for col in inspector.get_columns('users')]
            print(f"\n📋 Final columns in users table: {final_columns}")
            
            oauth_columns = ['google_id', 'name', 'picture', 'created_at', 'subscription_plan', 'trial_ends_at']
            missing_columns = [col for col in oauth_columns if col not in final_columns]
            
            if missing_columns:
                print(f"⚠ Warning: Missing OAuth columns: {missing_columns}")
            else:
                print("✅ All OAuth columns are present!")
                
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🚀 Starting SQLite Google OAuth Database Migration")
    print("=" * 50)
    
    migrate_oauth_fields_sqlite()
    
    print("\n" + "=" * 50)
    print("✅ Migration script completed!")
    print("\nNext steps:")
    print("1. Restart your backend server")
    print("2. Test Google OAuth login")
    print("3. Verify user creation in database") 