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