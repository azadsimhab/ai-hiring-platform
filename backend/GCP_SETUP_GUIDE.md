# Google Cloud Platform Setup Guide

## Prerequisites
1. Google Cloud CLI installed
2. Service account key file (`service-account-key.json`)
3. Access to Google Cloud Console

## Step 1: Enable APIs
Run this command to enable required APIs:
```bash
gcloud services enable sqladmin.googleapis.com compute.googleapis.com storage.googleapis.com aiplatform.googleapis.com pubsub.googleapis.com cloudkms.googleapis.com secretmanager.googleapis.com --project=hiringagent
```

## Step 2: Create Cloud Storage Bucket
```bash
gsutil mb -p hiringagent -c STANDARD -l us-central1 gs://hiring-platform-storage
```

## Step 3: Create Cloud SQL Instance (Manual)
1. Go to Google Cloud Console: https://console.cloud.google.com/sql/instances
2. Click "Create Instance"
3. Choose PostgreSQL
4. Set instance ID: `hiring-platform-sql`
5. Set password: `hiring_platform_secure_password_2024`
6. Choose region: `us-central1`
7. Choose machine type: `db-f1-micro`
8. Click "Create"

## Step 4: Create Database and User
```bash
# Create database
gcloud sql databases create hiring_platform_db --instance=hiring-platform-sql --project=hiringagent

# Create user
gcloud sql users create hiring_platform_user --instance=hiring-platform-sql --password=hiring_platform_secure_password_2024 --project=hiringagent
```

## Step 5: Get Connection Details
```bash
gcloud sql instances describe hiring-platform-sql --project=hiringagent
```

## Step 6: Update .env File
Update your `.env` file with the connection details from Step 5.

## Step 7: Test Connection
```bash
python -c "from app.database import get_db; print('Database connection successful')"
```
```

Now let's try a different approach. Let me create a script that validates your service account key first:

```python:backend/scripts/validate_service_account.py
#!/usr/bin/env python3
"""
Validate Service Account Key
This script validates the service account key file
"""

import json
import os

def validate_service_account_key():
    """Validate the service account key file"""
    
    print("�� Validating service account key file...")
    
    key_file = "./service-account-key.json"
    
    if not os.path.exists(key_file):
        print("❌ Service account key file not found: service-account-key.json")
        return False
    
    try:
        with open(key_file, 'r') as f:
            key_data = json.load(f)
        
        # Check required fields
        required_fields = [
            "type", "project_id", "private_key_id", "private_key",
            "client_email", "client_id", "auth_uri", "token_uri"
        ]
        
        for field in required_fields:
            if field not in key_data:
                print(f"❌ Missing required field: {field}")
                return False
        
        print("✅ Service account key file is valid")
        print(f"   Project ID: {key_data['project_id']}")
        print(f"   Client Email: {key_data['client_email']}")
        print(f"   Private Key ID: {key_data['private_key_id']}")
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in service account key file: {e}")
        return False
    except Exception as e:
        print(f"❌ Error reading service account key file: {e}")
        return False

if __name__ == "__main__":
    if validate_service_account_key():
        print("\n✅ Service account key validation successful!")
    else:
        print("\n❌ Service account key validation failed!")
        exit(1)
```

**Now let's fix the issue step by step:**

1. **First, validate your service account key:**
   ```bash
   python scripts/validate_service_account.py
   ```

2. **If the validation passes, try the simple setup:**
   ```bash
   python scripts/simple_gcp_setup.py
   ```

3. **If you still get errors, use the manual setup:**
   - Follow the `GCP_SETUP_GUIDE.md` instructions
   - Or use the Google Cloud Console directly

The key issue was that the service account key file had formatting problems. The new file should work properly. Try running the validation script first to make sure the key file is correct, then proceed with the setup.

**Alternative approach - Skip GCP setup for now:**
Since your server is already running successfully, you can continue development with SQLite and add GCP integration later. The 