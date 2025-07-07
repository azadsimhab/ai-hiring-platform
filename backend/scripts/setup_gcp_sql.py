#!/usr/bin/env python3
"""
Google Cloud SQL Setup Script for AI Hiring Platform
This script sets up the Google Cloud SQL instance and database
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        r 