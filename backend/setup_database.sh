#!/bin/bash

echo "🚀 Setting up AI Hiring Platform Database..."

# Install PostgreSQL client
echo "📦 Installing PostgreSQL client..."
pip install psycopg2-binary

# Install other dependencies
echo "📦 Installing other dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "�� Creating .env file..."
    cat > .env << EOF
# Google Cloud SQL Configuration
DATABASE_URL=postgresql://hiring_platform_user:your_password@34.123.45.67:5432/hiring_platform_db
GCP_PROJECT_ID=your-gcp-project-id
GCP_REGION=us-central1
CLOUD_SQL_INSTANCE=hiring-platform-sql
CLOUD_SQL_DATABASE=hiring_platform_db
CLOUD_SQL_USER=hiring_platform_user
CLOUD_SQL_PASSWORD=your-secure-password
CLOUD_SQL_HOST=34.123.45.67
CLOUD_SQL_PORT=5432

# JWT Settings
SECRET_KEY=your-super-secret-key-change-in-production

# Other GCP Settings
VERTEX_AI_LOCATION=us-central1
GEMINI_MODEL=gemini-1.5-flash
CLOUD_STORAGE_BUCKET=hiring-platform-storage
EOF
    echo "✅ .env file created. Please update it with your actual values."
fi

echo "✅ Database setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your Google Cloud SQL credentials"
echo "2. Run: python scripts/setup_gcp_sql.py (if you haven't set up GCP SQL yet)"
echo "3. Test the connection: python -c \"from app.database import get_db; print('Success')\""
echo "4. Start the server: python -m uvicorn app.main:app --reload" 