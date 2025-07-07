#!/usr/bin/env python3
"""
Production-Ready Google Cloud Platform Infrastructure Setup
God-tier GCP architecture for AI Hiring Platform
"""

import os
import json
import subprocess
import sys
import time
from pathlib import Path

class ProductionGCPSetup:
    def __init__(self):
        self.project_id = "hiringagent"
        self.region = "us-central1"
        self.zone = "us-central1-a"
        self.service_account_email = "hiring-ai@hiringagent.iam.gserviceaccount.com"
        
    def run_command(self, command, description, check=True):
        """Run a shell command with proper error handling"""
        print(f"🔄 {description}...")
        try:
            result = subprocess.run(command, shell=True, check=check, capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ {description} completed successfully")
                return result.stdout
            else:
                print(f"⚠️ {description} returned non-zero exit code: {result.stderr}")
                return None
        except subprocess.CalledProcessError as e:
            print(f"❌ {description} failed: {e}")
            print(f"Error output: {e.stderr}")
            return None

    def setup_gcp_infrastructure(self):
        """Set up complete GCP infrastructure"""
        print("🚀 Setting up Production-Ready GCP Infrastructure for AI Hiring Platform...")
        print("=" * 80)
        
        # Step 1: Authenticate and set project
        if not self._authenticate_and_set_project():
            return False
            
        # Step 2: Enable APIs
        if not self._enable_apis():
            return False
            
        # Step 3: Create VPC and networking
        if not self._setup_networking():
            return False
            
        # Step 4: Create Cloud SQL instance
        if not self._setup_cloud_sql():
            return False
            
        # Step 5: Create Cloud Storage buckets
        if not self._setup_cloud_storage():
            return False
            
        # Step 6: Set up Vertex AI
        if not self._setup_vertex_ai():
            return False
            
        # Step 7: Set up Pub/Sub
        if not self._setup_pubsub():
            return False
            
        # Step 8: Set up Cloud KMS
        if not self._setup_cloud_kms():
            return False
            
        # Step 9: Set up monitoring and logging
        if not self._setup_monitoring():
            return False
            
        # Step 10: Update configuration
        if not self._update_configuration():
            return False
            
        print("\n🎉 Production GCP Infrastructure Setup Completed!")
        return True

    def _authenticate_and_set_project(self):
        """Authenticate with service account and set project"""
        print("\n🔐 Step 1: Authentication and Project Setup")
        
        # Set project
        if not self.run_command(f"gcloud config set project {self.project_id}", "Setting project"):
            return False
            
        # Authenticate with service account
        auth_cmd = f"gcloud auth activate-service-account {self.service_account_email} --key-file=./service-account-key.json"
        if not self.run_command(auth_cmd, "Authenticating with service account"):
            return False
            
        return True

    def _enable_apis(self):
        """Enable required Google Cloud APIs"""
        print("\n🔧 Step 2: Enabling Google Cloud APIs")
        
        apis = [
            "sqladmin.googleapis.com",
            "compute.googleapis.com",
            "storage.googleapis.com",
            "aiplatform.googleapis.com",
            "pubsub.googleapis.com",
            "cloudkms.googleapis.com",
            "secretmanager.googleapis.com",
            "cloudbuild.googleapis.com",
            "run.googleapis.com",
            "container.googleapis.com",
            "monitoring.googleapis.com",
            "logging.googleapis.com",
            "cloudtrace.googleapis.com",
            "cloudprofiler.googleapis.com",
            "errorreporting.googleapis.com"
        ]
        
        for api in apis:
            self.run_command(f"gcloud services enable {api} --project={self.project_id}", f"Enabling {api}", check=False)
            
        return True

    def _setup_networking(self):
        """Set up VPC and networking"""
        print("\n�� Step 3: Setting up Networking")
        
        # Create VPC
        vpc_name = "hiring-platform-vpc"
        create_vpc_cmd = f"gcloud compute networks create {vpc_name} --subnet-mode=auto --project={self.project_id}"
        if not self.run_command(create_vpc_cmd, "Creating VPC", check=False):
            print("⚠️ VPC might already exist, continuing...")
            
        # Create firewall rules
        firewall_rules = [
            {
                "name": "hiring-platform-allow-http",
                "allow": "tcp:80,tcp:443",
                "source_ranges": "0.0.0.0/0"
            },
            {
                "name": "hiring-platform-allow-ssh",
                "allow": "tcp:22",
                "source_ranges": "0.0.0.0/0"
            }
        ]
        
        for rule in firewall_rules:
            create_firewall_cmd = f"gcloud compute firewall-rules create {rule['name']} --network={vpc_name} --allow={rule['allow']} --source-ranges={rule['source_ranges']} --project={self.project_id}"
            self.run_command(create_firewall_cmd, f"Creating firewall rule {rule['name']}", check=False)
            
        return True

    def _setup_cloud_sql(self):
        """Set up Cloud SQL instance"""
        print("\n🗄️ Step 4: Setting up Cloud SQL")
        
        instance_name = "hiring-platform-sql"
        database_name = "hiring_platform_db"
        user_name = "hiring_platform_user"
        password = "HiringPlatform2024!Secure"
        
        # Create Cloud SQL instance
        create_instance_cmd = f"""
        gcloud sql instances create {instance_name} \
            --project={self.project_id} \
            --database-version=POSTGRES_14 \
            --tier=db-custom-2-4096 \
            --region={self.region} \
            --storage-type=SSD \
            --storage-size=20GB \
            --backup-start-time=02:00 \
            --maintenance-window-day=SUN \
            --maintenance-window-hour=03:00 \
            --availability-type=regional \
            --backup-configuration=backup-configuration=backup-retention-count=7 \
            --database-flags=backup-configuration=backup-retention-count=7 \
            --deletion-protection
        """
        
        if not self.run_command(create_instance_cmd, "Creating Cloud SQL instance", check=False):
            print("⚠️ Cloud SQL instance might already exist, continuing...")
            
        # Create database
        create_db_cmd = f"gcloud sql databases create {database_name} --instance={instance_name} --project={self.project_id}"
        if not self.run_command(create_db_cmd, "Creating database", check=False):
            print("⚠️ Database might already exist, continuing...")
            
        # Create user
        create_user_cmd = f"gcloud sql users create {user_name} --instance={instance_name} --password={password} --project={self.project_id}"
        if not self.run_command(create_user_cmd, "Creating database user", check=False):
            print("⚠️ User might already exist, continuing...")
            
        # Get connection info
        instance_info = self.run_command(f"gcloud sql instances describe {instance_name} --project={self.project_id}", "Getting instance info")
        
        if instance_info:
            # Extract public IP
            public_ip = None
            for line in instance_info.split('\n'):
                if 'ipAddress:' in line:
                    public_ip = line.split(':')[1].strip()
                    break
                    
            if public_ip:
                self.sql_connection_info = {
                    "host": public_ip,
                    "database": database_name,
                    "user": user_name,
                    "password": password,
                    "port": 5432
                }
                print(f"✅ Cloud SQL connection info: {public_ip}:5432")
                
        return True

    def _setup_cloud_storage(self):
        """Set up Cloud Storage buckets"""
        print("\n�� Step 5: Setting up Cloud Storage")
        
        buckets = [
            "hiring-platform-storage",
            "hiring-platform-backups",
            "hiring-platform-logs",
            "hiring-platform-resumes",
            "hiring-platform-videos"
        ]
        
        for bucket in buckets:
            create_bucket_cmd = f"gsutil mb -p {self.project_id} -c STANDARD -l {self.region} gs://{bucket}"
            if not self.run_command(create_bucket_cmd, f"Creating bucket {bucket}", check=False):
                print(f"⚠️ Bucket {bucket} might already exist, continuing...")
                
        return True

    def _setup_vertex_ai(self):
        """Set up Vertex AI"""
        print("\n�� Step 6: Setting up Vertex AI")
        
        # Create Vertex AI dataset
        dataset_name = "hiring_platform_dataset"
        create_dataset_cmd = f"gcloud ai datasets create --display-name={dataset_name} --region={self.region} --project={self.project_id}"
        self.run_command(create_dataset_cmd, "Creating Vertex AI dataset", check=False)
        
        return True

    def _setup_pubsub(self):
        """Set up Pub/Sub topics and subscriptions"""
        print("\n�� Step 7: Setting up Pub/Sub")
        
        topics = [
            "hiring-requests",
            "resume-analysis",
            "interview-sessions",
            "coding-tests",
            "notifications"
        ]
        
        for topic in topics:
            create_topic_cmd = f"gcloud pubsub topics create {topic} --project={self.project_id}"
            if not self.run_command(create_topic_cmd, f"Creating topic {topic}", check=False):
                print(f"⚠️ Topic {topic} might already exist, continuing...")
                
        return True

    def _setup_cloud_kms(self):
        """Set up Cloud KMS"""
        print("\n�� Step 8: Setting up Cloud KMS")
        
        keyring_name = "hiring-platform-keyring"
        key_name = "hiring-platform-key"
        
        # Create keyring
        create_keyring_cmd = f"gcloud kms keyrings create {keyring_name} --location={self.region} --project={self.project_id}"
        if not self.run_command(create_keyring_cmd, "Creating KMS keyring", check=False):
            print("⚠️ Keyring might already exist, continuing...")
            
        # Create key
        create_key_cmd = f"gcloud kms keys create {key_name} --keyring={keyring_name} --location={self.region} --purpose=encryption --project={self.project_id}"
        if not self.run_command(create_key_cmd, "Creating KMS key", check=False):
            print("⚠️ Key might already exist, continuing...")
            
        return True

    def _setup_monitoring(self):
        """Set up monitoring and logging"""
        print("\n�� Step 9: Setting up Monitoring and Logging")
        
        # Create log sink
        sink_name = "hiring-platform-logs"
        create_sink_cmd = f"gcloud logging sinks create {sink_name} gs://hiring-platform-logs --project={self.project_id}"
        self.run_command(create_sink_cmd, "Creating log sink", check=False)
        
        return True

    def _update_configuration(self):
        """Update configuration files"""
        print("\n⚙️ Step 10: Updating Configuration")
        
        # Update .env file with production settings
        env_content = f"""# Production Google Cloud Platform Configuration
GCP_PROJECT_ID=hiringagent
GCP_REGION=us-central1
GOOGLE_CLOUD_PROJECT_ID=hiringagent
GOOGLE_CLOUD_STORAGE_BUCKET=hiring-platform-storage
GOOGLE_CLOUD_SECRET_MANAGER_PROJECT_ID=hiringagent
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Production Database Configuration (Google Cloud SQL)
DATABASE_URL=postgresql://{self.sql_connection_info['user']}:{self.sql_connection_info['password']}@{self.sql_connection_info['host']}:{self.sql_connection_info['port']}/{self.sql_connection_info['database']}

# JWT Settings
SECRET_KEY=production-super-secret-key-change-immediately
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Vertex AI Settings
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-1.5-flash

# Cloud Storage Settings
CLOUD_STORAGE_BUCKET=hiring-platform-storage
CLOUD_STORAGE_BACKUPS=hiring-platform-backups
CLOUD_STORAGE_LOGS=hiring-platform-logs
CLOUD_STORAGE_RESUMES=hiring-platform-resumes
CLOUD_STORAGE_VIDEOS=hiring-platform-videos

# Cloud SQL Settings
CLOUD_SQL_INSTANCE=hiring-platform-sql
CLOUD_SQL_DATABASE={self.sql_connection_info['database']}
CLOUD_SQL_USER={self.sql_connection_info['user']}
CLOUD_SQL_PASSWORD={self.sql_connection_info['password']}
CLOUD_SQL_HOST={self.sql_connection_info['host']}
CLOUD_SQL_PORT={self.sql_connection_info['port']}

# Pub/Sub Topics
PUBSUB_TOPIC_HIRING_REQUESTS=hiring-requests
PUBSUB_TOPIC_RESUME_ANALYSIS=resume-analysis
PUBSUB_TOPIC_INTERVIEW_SESSIONS=interview-sessions
PUBSUB_TOPIC_CODING_TESTS=coding-tests
PUBSUB_TOPIC_NOTIFICATIONS=notifications

# Cloud KMS Settings
KMS_KEYRING=hiring-platform-keyring
KMS_KEY=hiring-platform-key
KMS_LOCATION=us-central1

# Production Settings
ENVIRONMENT=production
ENABLE_AI_FEATURES=true
ENABLE_FILE_UPLOAD=true
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_MONITORING=true
ENABLE_LOGGING=true

# Security Settings
CORS_ORIGINS=["https://hiring-platform.com", "https://www.hiring-platform.com"]
RATE_LIMIT_PER_MINUTE=1000
RATE_LIMIT_PER_HOUR=10000

# Monitoring
SENTRY_DSN=your-sentry-dsn
"""
        
        with open(".env", "w") as f:
            f.write(env_content)
            
        print("✅ Configuration files updated")
        return True

def main():
    setup = ProductionGCPSetup()
    if setup.setup_gcp_infrastructure():
        print("\n🎉 Production GCP Infrastructure Setup Completed Successfully!")
        print("\n📋 Next Steps:")
        print("1. Install production dependencies: pip install -r requirements.txt")
        print("2. Test database connection: python -c \"from app.database import get_db; print('Success')\"")
        print("3. Deploy to Cloud Run: gcloud run deploy hiring-platform-api --source .")
        print("4. Set up CI/CD pipeline")
        print("5. Configure monitoring and alerts")
    else:
        print("\n❌ Setup failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 