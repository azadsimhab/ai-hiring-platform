#!/usr/bin/env python3
"""
Google Cloud Platform Setup Script for AI Hiring Platform
This script sets up GCP services using your service account
"""

import os
import json
import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return None

def setup_gcp_services():
    """Set up Google Cloud Platform services"""
    
    print("🚀 Setting up Google Cloud Platform services for AI Hiring Platform...")
    
    # Check if gcloud is installed
    if run_command("gcloud --version", "Checking gcloud CLI") is None:
        print("❌ Google Cloud CLI not found. Please install it first:")
        print("   https://cloud.google.com/sdk/docs/install")
        return False
    
    # Set project ID
    project_id = "hiringagent"
    
    # Authenticate with service account
    print(f"\n🔐 Authenticating with service account...")
    auth_cmd = f"gcloud auth activate-service-account hiring-ai@hiringagent.iam.gserviceaccount.com --key-file=./service-account-key.json --project={project_id}"
    if run_command(auth_cmd, "Authenticating with service account") is None:
        return False
    
    # Set project
    set_project_cmd = f"gcloud config set project {project_id}"
    if run_command(set_project_cmd, "Setting project") is None:
        return False
    
    # Enable required APIs
    print("\n🔧 Enabling required Google Cloud APIs...")
    apis = [
        "sqladmin.googleapis.com",
        "compute.googleapis.com",
        "storage.googleapis.com",
        "aiplatform.googleapis.com",
        "pubsub.googleapis.com",
        "cloudkms.googleapis.com",
        "secretmanager.googleapis.com"
    ]
    
    for api in apis:
        run_command(f"gcloud services enable {api} --project={project_id}", f"Enabling {api}")
    
    # Create Cloud Storage bucket
    print("\n🗄️ Creating Cloud Storage bucket...")
    bucket_name = "hiring-platform-storage"
    create_bucket_cmd = f"gsutil mb -p {project_id} -c STANDARD -l us-central1 gs://{bucket_name}"
    if run_command(create_bucket_cmd, "Creating Cloud Storage bucket") is None:
        print("⚠️ Bucket might already exist, continuing...")
    
    # Create Cloud SQL instance (if not exists)
    print("\n🗄️ Creating Cloud SQL instance...")
    instance_name = "hiring-platform-sql"
    create_instance_cmd = f"""
    gcloud sql instances create {instance_name} \
        --project={project_id} \
        --database-version=POSTGRES_14 \
        --tier=db-f1-micro \
        --region=us-central1 \
        --storage-type=SSD \
        --storage-size=10GB \
        --backup-start-time=02:00 \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=03:00 \
        --availability-type=zonal \
        --no-deletion-protection
    """
    
    if run_command(create_instance_cmd, "Creating Cloud SQL instance") is None:
        print("⚠️ Instance might already exist, continuing...")
    
    # Create database
    print("\n📊 Creating database...")
    create_db_cmd = f"gcloud sql databases create hiring_platform_db --instance={instance_name} --project={project_id}"
    if run_command(create_db_cmd, "Creating database") is None:
        print("⚠️ Database might already exist, continuing...")
    
    # Create user
    print("\n👤 Creating database user...")
    password = "hiring_platform_secure_password_2024"
    create_user_cmd = f"gcloud sql users create hiring_platform_user --instance={instance_name} --password={password} --project={project_id}"
    if run_command(create_user_cmd, "Creating database user") is None:
        print("⚠️ User might already exist, continuing...")
    
    # Get instance connection info
    print("\n🔍 Getting instance connection information...")
    instance_info = run_command(f"gcloud sql instances describe {instance_name} --project={project_id}", "Getting instance info")
    
    if instance_info:
        # Extract public IP
        public_ip = None
        for line in instance_info.split('\n'):
            if 'ipAddress:' in line:
                public_ip = line.split(':')[1].strip()
                break
        
        if public_ip:
            # Update .env file with Cloud SQL details
            print("\n�� Updating .env file with Cloud SQL details...")
            env_content = f"""# Google Cloud Platform Settings
GCP_PROJECT_ID=hiringagent
GCP_REGION=us-central1
GOOGLE_CLOUD_PROJECT_ID=hiringagent
GOOGLE_CLOUD_STORAGE_BUCKET=hiring-platform-storage
GOOGLE_CLOUD_SECRET_MANAGER_PROJECT_ID=hiringagent
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Database Configuration (Google Cloud SQL)
DATABASE_URL=postgresql://hiring_platform_user:{password}@{public_ip}:5432/hiring_platform_db

# JWT Settings
SECRET_KEY=your-super-secret-key-change-in-production

# Vertex AI Settings
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-1.5-flash

# Cloud Storage Settings
CLOUD_STORAGE_BUCKET=hiring-platform-storage

# Cloud SQL Settings
CLOUD_SQL_INSTANCE=hiring-platform-sql
CLOUD_SQL_DATABASE=hiring_platform_db
CLOUD_SQL_USER=hiring_platform_user
CLOUD_SQL_PASSWORD={password}
CLOUD_SQL_HOST={public_ip}
CLOUD_SQL_PORT=5432

# Other Settings
ENABLE_AI_FEATURES=true
ENABLE_FILE_UPLOAD=true
ENABLE_EMAIL_NOTIFICATIONS=false
"""
            
            with open(".env", "w") as f:
                f.write(env_content)
            
            print("✅ .env file updated with Cloud SQL details")
            print(f"\n🎉 Google Cloud Platform setup completed!")
            print(f"   Project ID: {project_id}")
            print(f"   Cloud Storage: gs://{bucket_name}")
            print(f"   Cloud SQL: {public_ip}:5432")
            print(f"   Database: hiring_platform_db")
            print(f"   User: hiring_platform_user")
            
            return True
    
    return False

if __name__ == "__main__":
    if setup_gcp_services():
        print("\n✅ GCP setup completed successfully!")
        print("Next steps:")
        print("1. Install PostgreSQL client: pip install psycopg2-binary")
        print("2. Test the connection with: python -c \"from app.database import get_db; print('Database connection successful')\"")
        print("3. Start the server: python -m uvicorn app.main:app --reload")
    else:
        print("\n❌ Setup failed. Please check the error messages above.")
        sys.exit(1) 