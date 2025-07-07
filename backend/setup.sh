#!/bin/bash

echo "🚀 Setting up AI Hiring Platform..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Install PostgreSQL client
echo "📦 Installing PostgreSQL client..."
pip install psycopg2-binary

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Run: python scripts/setup_gcp_services.py (to set up GCP services)"
echo "2. Test the connection: python -c \"from app.database import get_db; print('Success')\""
echo "3. Start the server: python -m uvicorn app.main:app --reload" 