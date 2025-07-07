#!/usr/bin/env python3
"""
Comprehensive system check for AI Hiring Platform
"""
import sys
import os
import importlib
import requests
import json
import time
from pathlib import Path

def print_header(title):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}")

def print_success(msg):
    print(f"✓ {msg}")

def print_error(msg):
    print(f"✗ {msg}")

def print_warning(msg):
    print(f"⚠ {msg}")

def check_python_environment():
    """Check Python environment"""
    print_header("Python Environment")
    print_success(f"Python version: {sys.version}")
    print_success(f"Working directory: {os.getcwd()}")
    return True

def check_dependencies():
    """Check required dependencies"""
    print_header("Dependencies")
    required_packages = [
        ('fastapi', 'FastAPI'),
        ('uvicorn', 'Uvicorn'),
        ('sqlalchemy', 'SQLAlchemy'),
        ('pydantic', 'Pydantic'),
        ('pydantic_settings', 'PydanticSettings'),
        ('jose', 'python-jose'),
        ('passlib', 'passlib'),
        ('requests', 'requests')
    ]
    
    all_good = True
    for package, name in required_packages:
        try:
            importlib.import_module(package)
            print_success(f"{name}")
        except ImportError:
            print_error(f"{name} - MISSING")
            all_good = False
    
    return all_good

def check_project_structure():
    """Check project structure"""
    print_header("Project Structure")
    required_files = [
        'app/main.py',
        'app/core/config.py',
        'app/database.py',
        'app/models/__init__.py',
        'app/models/base.py',
        'app/models/user.py',
        'app/api/routes/auth.py',
        'app/services/auth_service.py',
        'requirements.txt'
    ]
    
    all_good = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print_success(f"{file_path}")
        else:
            print_error(f"{file_path} - MISSING")
            all_good = False
    
    return all_good

def check_imports():
    """Check if all modules can be imported"""
    print_header("Module Imports")
    try:
        from app.core.config import settings
        print_success("app.core.config")
        
        from app.database import get_db, init_db
        print_success("app.database")
        
        from app.models import User, HiringRequest, Candidate, Interview, CodingTest
        print_success("app.models")
        
        from app.services.auth_service import AuthService
        print_success("app.services.auth_service")
        
        from app.api.routes.auth import router
        print_success("app.api.routes.auth")
        
        return True
    except Exception as e:
        print_error(f"Import failed: {e}")
        return False

def check_database():
    """Check database setup"""
    print_header("Database Setup")
    try:
        from app.database import engine, init_db
        from app.models.base import Base
        
        # Check if database file exists
        db_file = "hiring_platform.db"
        if os.path.exists(db_file):
            print_success(f"Database file exists: {db_file}")
        else:
            print_warning(f"Database file will be created: {db_file}")
        
        # Try to initialize database
        try:
            init_db()
            print_success("Database initialization successful")
        except Exception as e:
            print_error(f"Database initialization failed: {e}")
            return False
        
        # Check tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        required_tables = ['users', 'hiring_requests', 'candidates', 'interviews', 'coding_tests']
        
        for table in required_tables:
            if table in tables:
                print_success(f"Table: {table}")
            else:
                print_error(f"Table missing: {table}")
                return False
        
        return True
    except Exception as e:
        print_error(f"Database check failed: {e}")
        return False

def check_server():
    """Check if server is running"""
    print_header("Server Status")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print_success("Server is running")
            print_success(f"Health check: {response.json()}")
            return True
        else:
            print_error(f"Server responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Server is not running on port 8000")
        return False
    except Exception as e:
        print_error(f"Server check failed: {e}")
        return False

def test_auth_endpoints():
    """Test authentication endpoints"""
    print_header("Authentication Endpoints")
    
    base_url = "http://localhost:8000"
    
    # Test registration
    try:
        user_data = {
            "email": "test@example.com",
            "username": "testuser",
            "first_name": "Test",
            "last_name": "User",
            "password": "password123",
            "role": "admin"
        }
        
        response = requests.post(
            f"{base_url}/api/auth/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            print_success("User registration successful")
        else:
            print_error(f"Registration failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Registration test failed: {e}")
        return False
    
    # Test login
    try:
        login_data = {
            "username": "test@example.com",
            "password": "password123"
        }
        
        response = requests.post(
            f"{base_url}/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code == 200:
            print_success("User login successful")
            token_data = response.json()
            token = token_data['access_token']
            
            # Test /me endpoint
            headers = {"Authorization": f"Bearer {token}"}
            me_response = requests.get(f"{base_url}/api/auth/me", headers=headers)
            
            if me_response.status_code == 200:
                print_success("User info retrieval successful")
                return True
            else:
                print_error(f"/me endpoint failed: {me_response.status_code}")
                return False
        else:
            print_error(f"Login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Login test failed: {e}")
        return False

def main():
    """Run all checks"""
    print_header("AI Hiring Platform - System Check")
    
    checks = [
        ("Python Environment", check_python_environment),
        ("Dependencies", check_dependencies),
        ("Project Structure", check_project_structure),
        ("Module Imports", check_imports),
        ("Database Setup", check_database),
        ("Server Status", check_server),
        ("Authentication Endpoints", test_auth_endpoints)
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print_error(f"{name} check failed with exception: {e}")
            results.append((name, False))
    
    # Summary
    print_header("Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"{name}: {status}")
    
    print(f"\nOverall: {passed}/{total} checks passed")
    
    if passed == total:
        print_success("All checks passed! System is ready.")
        return 0
    else:
        print_error("Some checks failed. Please fix the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 