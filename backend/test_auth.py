#!/usr/bin/env python3
"""
Simple test script to verify authentication endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_register():
    """Test user registration"""
    print("Testing user registration...")
    user_data = {
        "email": "admin@example.com",
        "username": "admin",
        "first_name": "Admin",
        "last_name": "User",
        "password": "password123",
        "role": "admin"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json=user_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        print("User registered successfully!")
        print(f"Response: {response.json()}")
    else:
        print(f"Error: {response.text}")
    print()

def test_login():
    """Test user login"""
    print("Testing user login...")
    login_data = {
        "username": "admin@example.com",
        "password": "password123"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("Login successful!")
        token_data = response.json()
        print(f"Access token: {token_data['access_token'][:50]}...")
        return token_data['access_token']
    else:
        print(f"Error: {response.text}")
        return None

def test_me_endpoint(token):
    """Test /me endpoint with token"""
    if not token:
        print("No token available, skipping /me test")
        return
    
    print("Testing /me endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("User info retrieved successfully!")
        print(f"Response: {response.json()}")
    else:
        print(f"Error: {response.text}")
    print()

def main():
    """Run all tests"""
    print("=== AI Hiring Platform Authentication Tests ===\n")
    
    test_health()
    test_register()
    token = test_login()
    test_me_endpoint(token)
    
    print("=== Tests completed ===")

if __name__ == "__main__":
    main() 