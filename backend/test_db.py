#!/usr/bin/env python3
"""
Test database connection and initialization
"""
from app.database import init_db, get_db
from app.models.user import User
from sqlalchemy.orm import Session

def test_database():
    """Test database connection and initialization"""
    print("Testing database initialization...")
    
    try:
        # Initialize database
        init_db()
        print("Database initialized successfully!")
        
        # Test database session
        db = next(get_db())
        print("Database session created successfully!")
        
        # Test query
        users = db.query(User).all()
        print(f"Found {len(users)} users in database")
        
        db.close()
        print("Database test completed successfully!")
        
    except Exception as e:
        print(f"Database test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_database() 