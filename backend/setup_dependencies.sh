#!/bin/bash

echo "🚀 Setting up AI Hiring Platform Dependencies..."

# Install PostgreSQL client
echo "📦 Installing PostgreSQL client..."
pip install psycopg2-binary

# Install Google Cloud dependencies
echo "📦 Installing Google Cloud dependencies..."
pip install google-cloud-aiplatform google-cloud-storage google-cloud-pubsub google-cloud-kms google-auth

# Install other dependencies
echo "📦 Installing other dependencies..."
pip install -r requirements.txt

echo "✅ Dependencies setup completed!"
echo ""
echo "Next steps:"
echo "1. Run: python scripts/setup_gcp_sql.py"
echo "2. Test the connection: python -c \"from app.database import get_db; print('Success')\""
echo "3. Start the server: python -m uvicorn app.main:app --reload" 